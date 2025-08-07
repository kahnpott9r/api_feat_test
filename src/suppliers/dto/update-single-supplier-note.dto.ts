import { PartialType } from '@nestjs/swagger';
import { CreateSupplierNoteDto } from './create-supplier-note.dto';

export class UpdateSingleSupplierNoteDto extends PartialType(CreateSupplierNoteDto) {} 