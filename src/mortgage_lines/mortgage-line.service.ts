import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MortgageLine, Type } from './entities/mortgage-line.entity';
import { configQuery, getPaginationKeys } from '../Utils/utils';
import { PageOptionsDto } from '../pagination/dtos';
import { PageDto } from '../pagination/page.dto';
import { PageMetaDto } from '../pagination/page-meta.dto';
import { UpdateMortgageLineDto } from './dto/update-mortgage-line.dto';
import {
  calculateAnnuityMortgageDetails,
  calculateLinearMortgageDetails,
} from '../properties/properties.service';
import { Property } from '../properties/entities/property.entity';

@Injectable()
export class MortgageLineService {
  constructor(
    @InjectRepository(MortgageLine)
    private mortgageLineRepository: Repository<MortgageLine>,
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
  ) {}

  // async create(
  //   property: Property,
  //   createMortgageLineDto: CreateMortgageLineDto,
  // ) {
  //   console.log(property);
  //
  //   const mortgageLine = new MortgageLine();
  //   mortgageLine.startDate = new Date(createMortgageLineDto.startDate);
  //   mortgageLine.endDate = new Date(createMortgageLineDto.endDate);
  //   mortgageLine.type = createMortgageLineDto.type;
  //   mortgageLine.part = createMortgageLineDto.part;
  //   mortgageLine.amount = createMortgageLineDto.amount;
  //   mortgageLine.interestRate = createMortgageLineDto.interestRate;
  //   mortgageLine.property = property;
  //
  //   // Calculate mortgage details based on the type
  //   let mortgageDetails: {
  //     durationMonths: number;
  //     monthlyPayment: number;
  //     accumulatedAmount: number;
  //   };
  //
  //   if (mortgageLine.type === Type.ANNUITY) {
  //     mortgageDetails = calculateAnnuityMortgageDetails(
  //       mortgageLine.amount,
  //       mortgageLine.interestRate,
  //       mortgageLine.startDate,
  //       mortgageLine.endDate,
  //     );
  //   } else if (mortgageLine.type === Type.LINEAR) {
  //     mortgageDetails = calculateLinearMortgageDetails(
  //       mortgageLine.amount,
  //       mortgageLine.interestRate,
  //       mortgageLine.startDate,
  //       mortgageLine.endDate,
  //     );
  //   }
  //
  //   // Add calculated details to the mortgage line for reference (if needed)
  //   mortgageLine.duration = mortgageDetails.durationMonths;
  //   mortgageLine.monthlyPayment = mortgageDetails.monthlyPayment;
  //   mortgageLine.accumulatedAmount = mortgageDetails.accumulatedAmount;
  //
  //   return await this.mortgageLineRepository.save(mortgageLine);
  // }

  async updateMortgageLine(
    id: number,
    updateMortgageLineDto: UpdateMortgageLineDto,
  ) {
    const mortgageLine = await this.mortgageLineRepository.findOne({
      where: { id },
    });

    if (!mortgageLine) {
      throw new NotFoundException('Mortgage line not found');
    }

    // // Check if a mortgage for this property already exists with that part
    // const existingMortgage = await this.mortgageLineRepository.findOne({
    //   where: {
    //     property: mortgageLine.property,
    //     part: updateMortgageLineDto.part,
    //   },
    // });

    // if (existingMortgage && existingMortgage.id !== id) {
    //   throw new HttpException(
    //     'A mortgage with the same part already exists for this property',
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }

    mortgageLine.startDate = new Date(updateMortgageLineDto.startDate);
    mortgageLine.endDate = new Date(updateMortgageLineDto.endDate);
    mortgageLine.type = updateMortgageLineDto.type;
    mortgageLine.part = updateMortgageLineDto.part;
    mortgageLine.amount = updateMortgageLineDto.amount;
    mortgageLine.interestRate = updateMortgageLineDto.interestRate;

    let mortgageDetails: {
      durationMonths: number;
      monthlyPayment: number;
      accumulatedAmount: number;
      remainingAmount?: number;
      principalAmount?: number;
      interestPayment?: number;
      paymentsMade?: number;
    };
    if (mortgageLine.type === Type.ANNUITY) {
      mortgageDetails = calculateAnnuityMortgageDetails(
        mortgageLine.amount,
        mortgageLine.interestRate,
        mortgageLine.startDate,
        mortgageLine.endDate,
      );
    } else if (mortgageLine.type === Type.LINEAR) {
      mortgageDetails = calculateLinearMortgageDetails(
        mortgageLine.amount,
        mortgageLine.interestRate,
        mortgageLine.startDate,
        mortgageLine.endDate,
      );
    }

    mortgageLine.duration = mortgageDetails.durationMonths;
    mortgageLine.monthlyPayment = mortgageDetails.monthlyPayment;
    mortgageLine.accumulatedAmount = mortgageDetails.remainingAmount;

    console.log(mortgageDetails);

    // const finance = new Finance();
    // finance.amount = mortgageDetails.interestPayment;
    // finance.property = mortgageLine.property;
    // finance.status = PaymentStatus.MORTGAGE_INTEREST;
    // finance.address = 'Mortgage Interest';
    //
    // await this.financeRepository.save(finance);

    return await this.mortgageLineRepository.save(mortgageLine);
  }

  async getAllMortgageLines(pageOptionsDto: PageOptionsDto) {
    const queryBuilder =
      this.mortgageLineRepository.createQueryBuilder('mortgageLine');
    let query = queryBuilder.leftJoinAndSelect(
      'mortgageLine.property',
      'property',
    );

    const pageDtoKeys = getPaginationKeys(pageOptionsDto);
    const entityFields = this.mortgageLineRepository.metadata.columns.map(
      (col) => col.propertyName,
    );

    query = configQuery(
      'mortgageLine',
      pageDtoKeys,
      entityFields,
      pageOptionsDto,
      this.mortgageLineRepository.metadata,
      query,
    );

    const entities = await query.getMany();
    const itemCount = await queryBuilder.getCount();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(entities, pageMetaDto);
  }

  // async delete(id: number) {
  //   const mortgageLine = await this.mortgageLineRepository.findOne({
  //     where: { id },
  //     relations: ['property'],
  //   });
  //
  //   if (!mortgageLine) {
  //     throw new NotFoundException('Mortgage line not found');
  //   }
  //
  //   const property = await this.propertyRepository.findOne({
  //     where: { id: mortgageLine.property.id },
  //     relations: ['mortgageLines'],
  //   });
  //
  //   property.mortgageLines = property.mortgageLines.filter(
  //     (ml) => ml.id !== mortgageLine.id,
  //   );
  //
  //   await this.propertyRepository.save(property);
  //
  //   return await this.mortgageLineRepository.remove(mortgageLine);
  // }
}
