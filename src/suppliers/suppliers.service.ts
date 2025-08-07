import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Supplier } from "./entities/suppliers.entity";
import { Tenant } from "src/tenants/entities/tenant.entity";
import { CreateSupplierDto } from "./dto/create-supplier.dto";
import { ATACHMENT_TYPE, configQuery, getPaginationKeys } from "src/Utils/utils";
import { PageOptionsDto } from "src/pagination/dtos";
import { PageMetaDto } from "src/pagination/page-meta.dto";
import { PageDto } from "src/pagination/page.dto";
import { UpdateSupplierDto } from "./dto/update-supplier.dto";
import { UpdateSupplierAttachmentsDto, UpdateSingleSupplierAttachmentDto } from "./dto/update-supplier-attachment.dto";
import { SupplierAttachment } from "./entities/supplier-attachments.entity";
import { CreateSupplierAttachmentsDto } from "./dto/create-supplier-attachment.dto";
import { NoteEntity } from "src/properties/entities/note.entity";
import { UpdateSupplierNoteDto } from "./dto/update-supplier-note.dto";
import { CreateSupplierNoteDto } from "./dto/create-supplier-note.dto";
import { UpdateSingleSupplierNoteDto } from "./dto/update-single-supplier-note.dto";

const supplierCustomSorts: Record<string, string | ((key: string, direction: 'ASC' | 'DESC', entityAlias: string) => { sortProperty: string; sortDirection: 'ASC' | 'DESC' })> = {
  'name': 'company_name',
  'email': (key, direction, entityAlias) => ({
    sortProperty: `COALESCE(${entityAlias}.contact->>'email', ${entityAlias}.invoice_email)`,
    sortDirection: direction,
  }),
};

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Tenant) private tenantRepository: Repository<Tenant>,
    @InjectRepository(Supplier) private supplierRepository: Repository<Supplier>,
    @InjectRepository(SupplierAttachment) private supplierAttachmentRepository: Repository<SupplierAttachment>,
    @InjectRepository(NoteEntity) private noteRepository: Repository<NoteEntity>,
  ) {}

  async create(
    tenant: Tenant, 
    createDto: CreateSupplierDto) {
    const supplier = new Supplier();
    supplier.tenant = tenant;
    supplier.company_name = createDto.company_name;
    supplier.phone = createDto.phone;
    supplier.website = createDto.website;
    supplier.invoice_email = createDto.invoice_email;
    supplier.invoice_street = createDto.invoice_street;
    supplier.invoice_housenumber = createDto.invoice_housenumber;
    supplier.invoice_extensions = createDto.invoice_extensions;
    supplier.invoice_zipcode = createDto.invoice_zipcode;
    supplier.invoice_city = createDto.invoice_city;
    supplier.iban = createDto.iban;
    supplier.hourly_rate = createDto.hourly_rate;
    supplier.contact = createDto.contact;
    supplier.coc_number = createDto.coc_number;
    supplier.type = createDto.type;
    supplier.status = createDto.status;

    await supplier.save();

    if (createDto.notes && createDto.notes.length > 0) {
      const notes = createDto.notes.map(async (item) => {
        if (item.name || item.description) {
          const note = await this.noteRepository.create({
            supplier,
            ...item,
            history: item.history || [
              {
                timestamp: new Date().toISOString(),
                type: 'created',
              },
            ],
          });
          await this.noteRepository.save(note);
        }
      });
      await Promise.all(notes);
    }

    return supplier;
  }
  
  async getSupplierById(supplier: Supplier) {
    const queryBuilder = this.supplierRepository.createQueryBuilder('supplier');
    const entity = await queryBuilder
      .leftJoinAndSelect('supplier.tenant', 'tenant')
      .where('supplier.id = :supplierId', { supplierId: supplier.id })
      .getOne();
    return entity;
  }

  async getSuppliersByTenant(tenantId: number, pageOptionsDto: PageOptionsDto) {
    const queryBuilder = this.supplierRepository.createQueryBuilder('supplier');

    const pageDtoKeys = getPaginationKeys(pageOptionsDto);
    const entityFields = this.supplierRepository.metadata.columns.map(
      (col) => col.propertyName,
    );

    let query = queryBuilder
      .leftJoinAndSelect('supplier.tenant', 'tenant');

    query = configQuery(
      'supplier',
      pageDtoKeys,
      entityFields,
      pageOptionsDto,
      this.supplierRepository.metadata,
      query,
      true,
      supplierCustomSorts
    );
    query = query.andWhere('tenant.id = :tenantId', { tenantId: tenantId });

    const entities = await query.getMany();
    const itemCount = await queryBuilder.getCount();
    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto,
      allowUnpaginated: true,
    });
    return new PageDto(entities, pageMetaDto);
  }

  async updateSupplierById(
    supplier: Supplier,
    id: number,
    updateDto: UpdateSupplierDto,
  ) {
    const tenant = await this.tenantRepository.findOne({
      where: { id: supplier.tenant.id },
    });
    await this.supplierRepository.update(id, updateDto);
    const updatedSupplier = await this.supplierRepository.findOneBy({ id });
    if (!updatedSupplier) throw new NotFoundException(`Supplier with ID ${id} not found after update.`);
    return updatedSupplier;
  }

  async removeSupplierById(supplier: Supplier, id: number) {
    const supplierToRemove = await this.supplierRepository.findOne({
        where: { id },
        relations: ['attachments', 'tasks'],
    });

    if (!supplierToRemove) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    await this.supplierRepository.remove(supplierToRemove);
    return { message: 'Supplier deleted successfully' };
  }

  async getSupplierAttachments(supplierId: number) {
    const supplier = await this.supplierRepository.findOne({
      where: { id: supplierId },
      relations: ['attachments'],
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${supplierId} not found`);
    }

    return supplier.attachments;
  }

  async getSupplierNotes(supplierId: number) {
    const supplier = await this.supplierRepository.findOne({
      where: { id: supplierId },
      relations: ['notes'],
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${supplierId} not found`);
    }

    return supplier.notes;
  }

  async createSupplierAttachments(
    supplierId: number,
    loggedInSupplier: Supplier,
    createAttachmentsDto: CreateSupplierAttachmentsDto,
  ) {
    const supplier = await this.supplierRepository.findOneBy({ id: supplierId });
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${supplierId} not found`);
    }

    const attachmentEntities = createAttachmentsDto.attachments.map(dto => {
      let attachmentType = ATACHMENT_TYPE.FILE;
      if (dto.type) {
        attachmentType = dto.type;
      } else if (dto.mimeType && dto.mimeType.startsWith('image/')) {
        attachmentType = ATACHMENT_TYPE.IMAGE;
      }

      return this.supplierAttachmentRepository.create({
        ...dto,
        mimeType: dto.mimeType || '',
        size: dto.size || 0,
        description: dto.description,
        url: dto.url,
        type: attachmentType,
        supplier: supplier,
      });
    });

    if (attachmentEntities.length > 0) {
      await this.supplierAttachmentRepository.save(attachmentEntities);
    }

    return { message: 'Supplier attachments were added successfully', attachments: attachmentEntities };
  }

  async deleteSupplierAttachment(supplierId: number, attachmentId: number) {
    const supplier = await this.supplierRepository.findOneBy({ id: supplierId });
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${supplierId} not found`);
    }

    const attachment = await this.supplierAttachmentRepository.findOneBy({ 
      id: attachmentId, 
      supplier: { id: supplierId } 
    });

    if (!attachment) {
      throw new NotFoundException(
        `Attachment with ID ${attachmentId} not found for supplier ${supplierId}`
      );
    }

    await this.supplierAttachmentRepository.delete(attachmentId);

    return { message: 'Supplier attachment deleted successfully' };
  }

  async updateSingleSupplierAttachment(
    supplierId: number, 
    attachmentId: number, 
    updateDto: UpdateSingleSupplierAttachmentDto
  ) {
    const supplier = await this.supplierRepository.findOneBy({ id: supplierId });
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${supplierId} not found`);
    }

    const attachment = await this.supplierAttachmentRepository.findOneBy({ 
      id: attachmentId,
      supplier: { id: supplierId } 
    });

    if (!attachment) {
      throw new NotFoundException(
        `Attachment with ID ${attachmentId} not found for supplier ${supplierId}`
      );
    }

    if (updateDto.description !== undefined) {
      attachment.description = updateDto.description;
    }
    
    if (updateDto.type !== undefined) {
      attachment.type = updateDto.type;
    }

    await this.supplierAttachmentRepository.save(attachment);

    return attachment;
  }

  async updateSupplierNoteById(
    id: number,
    supplier: Supplier,
    updateNote: UpdateSupplierNoteDto,
  ) {
    try {
      // Get existing notes
      const existingNotes = await this.noteRepository.find({
        where: { supplier: { id } },
      });

      const existingNotesMap = new Map(
        existingNotes.map((note) => [note.id, note]),
      );

      const updatedNotes = [];

      if (updateNote.notes.length > 0) {
        for (const item of updateNote.notes) {
          if (item.id && existingNotesMap.has(item.id)) {
            // Update existing note
            const existingNote = existingNotesMap.get(item.id);
            const changes = [];

            if (existingNote.name !== item.name) {
              changes.push({
                type: 'name',
                old: existingNote.name,
                new: item.name,
              });
            }

            if (existingNote.description !== item.description) {
              changes.push({
                type: 'description',
                old: existingNote.description,
                new: item.description,
              });
            }

            if (changes.length > 0) {
              const history = existingNote.history || [];
              history.push({
                timestamp: new Date().toISOString(),
                changes,
              });

              const updatedNote = await this.noteRepository.save({
                ...existingNote,
                name: item.name,
                description: item.description,
                history,
              });
              updatedNotes.push(updatedNote);
            } else {
              updatedNotes.push(existingNote);
            }

            existingNotesMap.delete(item.id);
          } else {
            // Create new note
            const newNote = this.noteRepository.create({
              supplier,
              name: item.name,
              description: item.description,
              history: item.history || [
                {
                  timestamp: new Date().toISOString(),
                  type: 'created',
                },
              ],
            });
            const savedNote = await this.noteRepository.save(newNote);
            updatedNotes.push(savedNote);
          }
        }
      }

      // Delete notes that weren't in the update
      if (existingNotesMap.size > 0) {
        await this.noteRepository.delete(Array.from(existingNotesMap.keys()));
      }

      return updatedNotes;
    } catch (error) {
      console.error('Error updating supplier notes:', error);
      throw error;
    }
  }

  async createSupplierNote(
    supplierId: number,
    loggedInSupplier: Supplier,
    createNoteDto: CreateSupplierNoteDto,
  ) {
    const supplier = await this.supplierRepository.findOneBy({ id: supplierId });
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${supplierId} not found`);
    }

    const note = this.noteRepository.create({
      supplier,
      name: createNoteDto.name,
      description: createNoteDto.description,
      history: createNoteDto.history || [
        {
          timestamp: new Date().toISOString(),
          type: 'created',
        },
      ],
    });

    const savedNote = await this.noteRepository.save(note);
    return savedNote;
  }

  async updateSingleSupplierNote(
    supplierId: number,
    noteId: number,
    updateDto: UpdateSingleSupplierNoteDto,
  ) {
    const supplier = await this.supplierRepository.findOneBy({ id: supplierId });
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${supplierId} not found`);
    }

    const note = await this.noteRepository.findOneBy({
      id: noteId,
      supplier: { id: supplierId },
    });

    if (!note) {
      throw new NotFoundException(
        `Note with ID ${noteId} not found for supplier ${supplierId}`,
      );
    }

    const changes = [];

    if (updateDto.name !== undefined && note.name !== updateDto.name) {
      changes.push({
        type: 'name',
        old: note.name,
        new: updateDto.name,
      });
      note.name = updateDto.name;
    }

    if (updateDto.description !== undefined && note.description !== updateDto.description) {
      changes.push({
        type: 'description',
        old: note.description,
        new: updateDto.description,
      });
      note.description = updateDto.description;
    }

    if (changes.length > 0) {
      const history = note.history || [];
      history.push({
        timestamp: new Date().toISOString(),
        changes,
      });
      note.history = history;
    }

    const updatedNote = await this.noteRepository.save(note);
    return updatedNote;
  }

  async deleteSupplierNote(supplierId: number, noteId: number) {
    const supplier = await this.supplierRepository.findOneBy({ id: supplierId });
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${supplierId} not found`);
    }

    const note = await this.noteRepository.findOneBy({
      id: noteId,
      supplier: { id: supplierId },
    });

    if (!note) {
      throw new NotFoundException(
        `Note with ID ${noteId} not found for supplier ${supplierId}`,
      );
    }

    await this.noteRepository.delete(noteId);
    return { message: 'Supplier note deleted successfully' };
  }

  async getSupplierCountByTenant(tenantId: number): Promise<number> {
    const queryBuilder = this.supplierRepository.createQueryBuilder('supplier');
    return await queryBuilder
      .innerJoin('supplier.tenant', 'tenant')
      .where('tenant.id = :tenantId', { tenantId })
      .getCount();
  }
}