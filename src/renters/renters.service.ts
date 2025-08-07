import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';

import { Tenant } from '../tenants/entities/tenant.entity';
import { CreateRenterDto } from './dto/create-renter.dto';
import { UpdateRenterDto } from './dto/update-renter.dto';
import { Renter } from './entities/renters.entity';
import { Agreement } from '../agreements/entities/agreement.entity';
import { PageOptionsDto } from '../pagination/dtos';
import { PageMetaDto } from 'src/pagination/page-meta.dto';
import { PageDto } from 'src/pagination/page.dto';
import {
  ATACHMENT_TYPE,
  PropertyAttachment,
} from 'src/properties/entities/property-attachments.entity';
import { configQuery, getPaginationKeys } from 'src/Utils/utils';
import { NoteEntity } from 'src/properties/entities/note.entity';
import { UpdateRenterNoteDto } from './dto/update-renter-note.dto';
import { UpdateRenterAttachmentsDto } from './dto/update-renter-attachments.dto';
import { Finance } from 'src/finance/entites/finance.entity';
import { ExactOnlineService } from '../exact-online/exact-online.service';

@Injectable()
export class RentersService {
  private readonly logger = new Logger(RentersService.name);

  constructor(
    @InjectRepository(Tenant) private tenantRepository: Repository<Tenant>,
    @InjectRepository(PropertyAttachment)
    private attachmentRepository: Repository<PropertyAttachment>,
    @InjectRepository(Renter) private renterRepository: Repository<Renter>,
    @InjectRepository(NoteEntity)
    private noteRepository: Repository<NoteEntity>,
    private exactOnlineService: ExactOnlineService,
  ) {}

  async create(tenantId: number, createDto: CreateRenterDto) {
    const renter = new Renter();
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (tenant.hasExactOnline()) {
      const exactData = await this.exactOnlineService.getExactData(tenant.id);
      if (!createDto.exactId) {
        const exactAccount = await this.exactOnlineService.createAccount(
          exactData,
          createDto,
        );
        console.log(exactAccount.d.ID, 'exactAccount');

        renter.exactId = exactAccount.d.ID;
      } else {
        const exactAccount = await this.exactOnlineService.getAccount(
          exactData,
          createDto.exactId,
        );
        if (!exactAccount) {
          throw new NotFoundException('Exact account not found');
        }
        renter.exactId = createDto.exactId;
      }
    }

    renter.first_name = createDto.first_name;
    renter.last_name = createDto.last_name;
    renter.email = createDto.email;
    renter.phone = createDto.phone;
    renter.company_name = createDto.company_name;
    renter.invoice_email = createDto.invoice_email;
    renter.invoice_street = createDto.invoice_street;
    renter.invoice_housenumber = createDto.invoice_housenumber;
    renter.invoice_extensions = createDto.invoice_extensions;
    renter.invoice_zipcode = createDto.invoice_zipcode;
    renter.invoice_city = createDto.invoice_city;
    renter.iban = createDto.iban;
    renter.avatar = createDto.avatar;
    renter.kvk = createDto.kvk;
    renter.tax_id = createDto.tax_id;
    renter.tenant = tenant;
    if (renter.birth_day) renter.birth_day = createDto.birth_day;
    if (renter.gender) renter.gender = createDto.gender;
    await renter.save();

    const attachments = createDto.attachments.map(async (item) => {
      const attachment = await this.attachmentRepository.create({
        renter,
        ...item,
        type: ATACHMENT_TYPE.FILE,
      });
      await this.attachmentRepository.save(attachment);
    });
    await Promise.all(attachments);

    if (createDto.notes.length > 0) {
      const notes = createDto.notes.map(async (item) => {
        if (item.name || item.description) {
          const note = await this.noteRepository.create({
            renter,
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
    return renter;
  }

  async getAllRenters(pageOptionsDto: PageOptionsDto) {
    const queryBuilder = this.renterRepository.createQueryBuilder('renter');

    const pageDtoKeys = getPaginationKeys(pageOptionsDto);
    const entityFields = this.renterRepository.metadata.columns.map(
      (col) => col.propertyName,
    );

    let query = queryBuilder
      .leftJoinAndSelect('renter.tenant', 'tenant')
      .leftJoinAndSelect('renter.agreements', 'agreement')
      .leftJoinAndSelect('renter.attachments', 'attachments')
      .leftJoinAndSelect('renter.notes', 'note_entity');

    query = configQuery(
      'renter',
      pageDtoKeys,
      entityFields,
      pageOptionsDto,
      this.renterRepository.metadata,
      query,
    );

    const entities = await query.getMany();
    const itemCount = await queryBuilder.getCount();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto(entities, pageMetaDto);
  }

  async getRentersByTenant(tenantId: number, pageOptionsDto: PageOptionsDto) {
    const queryBuilder = this.renterRepository.createQueryBuilder('renter');

    const pageDtoKeys = getPaginationKeys(pageOptionsDto);
    const entityFields = this.renterRepository.metadata.columns.map(
      (col) => col.propertyName,
    );

    let query = queryBuilder
      .leftJoinAndSelect('renter.tenant', 'tenant')
      .leftJoinAndSelect('renter.agreements', 'agreement')
      .leftJoinAndSelect('renter.attachments', 'attachment')
      .leftJoinAndSelect('renter.notes', 'note_entity');

    query = configQuery(
      'renter',
      pageDtoKeys,
      entityFields,
      pageOptionsDto,
      this.renterRepository.metadata,
      query,
      true,
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

  async getRenterById(renter: Renter) {
    const queryBuilder = this.renterRepository.createQueryBuilder('renter');
    const entity = await queryBuilder
      .leftJoinAndSelect('renter.tenant', 'tenant')
      .leftJoinAndSelect('renter.agreements', 'agreement')
      .leftJoinAndSelect('renter.attachments', 'attachment')
      .leftJoinAndSelect('renter.notes', 'note_entity')
      .where('renter.id = :renterId', { renterId: renter.id })
      .getOne();
    return entity;
  }

  async removeRenterById(renter: Renter, id: number) {
    const agreements: Agreement[] = await Agreement.createQueryBuilder(
      'agreements',
    )
      .leftJoinAndSelect('agreements.renters', 'renters')
      .where('renters.id = :renterId', { renterId: id })
      .getMany();

    const saveAgreementsMap = agreements.map(async (agreement) => {
      agreement.renters = agreement.renters.filter((item) => item.id != id);
      await Agreement.save(agreement);
    });
    await Promise.all(saveAgreementsMap);

    const agreementsPriority: Agreement[] = await Agreement.createQueryBuilder(
      'agreements',
    )
      .leftJoinAndSelect('agreements.primaryRenter', 'renters')
      .where('renters.id = :renterId', { renterId: id })
      .getMany();

    const saveAgreementsPriorityMap = agreementsPriority.map(
      async (agreement) => {
        if (agreement.primaryRenter.id == id) agreement.primaryRenter = null;
        await Agreement.save(agreement);
      },
    );
    await Promise.all(saveAgreementsPriorityMap);

    await NoteEntity.delete({
      renter: { id },
    });

    await Finance.delete({
      renter: { id },
    });

    await PropertyAttachment.delete({
      renter: { id },
    });

    await this.renterRepository.delete(id);
    return 'Renter was deleted.';
  }

  async updateRenterById(
    renter: Renter,
    id: number,
    updateDto: UpdateRenterDto,
  ) {
    const tenant = await this.tenantRepository.findOne({
      where: { id: renter.tenant.id },
    });
    if (tenant.hasExactOnline()) {
      if (renter.exactId) {
        const exactData = await this.exactOnlineService.getExactData(
          renter.tenant.id,
        );

        await this.exactOnlineService.updateAccount(
          exactData,
          renter.exactId,
          updateDto,
        );
      } else {
        const exactData = await this.exactOnlineService.getExactData(tenant.id);
        const exactAccount = await this.exactOnlineService.createAccount(
          exactData,
          { ...renter, tenantId: renter.tenant.id },
        );
        console.log(exactAccount.d.ID, 'exactAccount');

        updateDto.exactId = exactAccount.d.ID;
      }
    }
    await this.renterRepository.update(id, updateDto);

    return this.getRenterById(renter);
  }

  // note.service.ts
  async updateRenterNoteById(
    id: number,
    renter: Renter,
    updateNote: UpdateRenterNoteDto,
  ) {
    try {
      // Get existing notes
      const existingNotes = await this.noteRepository.find({
        where: { renter: { id } },
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
              renter,
              name: item.name,
              description: item.description,
              history: [
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
      this.logger.error('Error updating renter notes:', error);
      throw error;
    }
  }

  async updateRenterAttachmentsById(
    id: number,
    renter: Renter,
    updateAttachments: UpdateRenterAttachmentsDto,
  ) {
    await PropertyAttachment.delete({
      renter: { id },
    });

    const attachments = updateAttachments.attachments.map(async (item) => {
      const attachment = await this.attachmentRepository.create({
        renter,
        ...item,
        type: ATACHMENT_TYPE.FILE,
      });
      await this.attachmentRepository.save(attachment);
    });

    await Promise.all(attachments);
    return 'Renter attachments was updated';
  }

  async getRentersByExactIds(exactIds: string[]) {
    const renters = await this.renterRepository.find({
      where: {
        exactId: In(exactIds),
      },
    });

    return renters.map((renter) => renter.exactId);
  }

  async removeAllExact() {
    const renters = await this.renterRepository.find({
      where: {
        exactId: Not(IsNull()),
      },
    });
    for (const renter of renters) {
      renter.exactId = null;
    }

    await this.renterRepository.save(renters);
  }
}
