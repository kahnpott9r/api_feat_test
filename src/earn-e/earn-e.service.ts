import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EarnEProperty } from './entities/earn-e-property.entity';
import { Repository } from 'typeorm';
import { Property } from '../properties/entities/property.entity';
import { CustomRMQClient } from './custom-rmq-server';

@Injectable()
export class EarnEService implements OnModuleInit {
  private isListening = false;

  constructor(
    @Inject('RABBITMQ_SERVICE') private readonly client: CustomRMQClient,
    @InjectRepository(EarnEProperty)
    private readonly earnEPropertyRepository: Repository<EarnEProperty>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
  ) {}

  async onModuleInit() {
    await this.connectAndHandleMessages();
  }

  private async connectAndHandleMessages() {
    await this.connectToRabbitMQ();
    this.setupReconnectionHandler();
  }

  async connectToRabbitMQ() {
    try {
      console.log('Connecting to RabbitMQ');
      await this.client.connect();
      console.log('RabbitMQ client connected successfully');
      this.listenForMessages();
    } catch (error) {
      console.error('Failed to connect to RabbitMQ', {
        err: error,
      });
      // Retry connection after a delay
      setTimeout(() => this.connectToRabbitMQ(), 300000);
    }
  }

  private setupReconnectionHandler() {
    this.client.on('disconnected', () => {
      console.log('RabbitMQ connection closed. Attempting to reconnect...');
      this.isListening = false;
      this.connectToRabbitMQ();
    });
  }

  async listenForMessages() {
    if (this.isListening) return;

    try {
      console.log('Listening for messages');
      this.isListening = true;

      const channel = await this.client.getChannel();
      const queue = this.client.getQueue();

      await channel.consume(queue, async (msg) => {
        if (msg !== null) {
          const messageContent = msg.content.toString();
          try {
            const data = JSON.parse(messageContent);
            await this.handleMessage(data);
            channel.ack(msg);
          } catch (error) {
            console.error('Error processing message:', error);
            // Optionally, you can nack the message here
            // channel.nack(msg, false, true);
          }
        }
      });
    } catch (error) {
      console.error('Failed to listen for messages from RabbitMQ', error);
      this.isListening = false;
      // Retry listening after a delay
      setTimeout(() => this.listenForMessages(), 300000);
    }
  }

  private validateMessage(data: any): boolean {
    const requiredFields = [
      'swVersion',
      'deviceId',
      'geo',
      'model',
      'wifiRSSI',
      'energy_delivered_tariff1',
      'energy_delivered_tariff2',
      'energy_returned_tariff1',
      'energy_returned_tariff2',
      'gas_delivered',
      'power_delivered',
      'power_returned',
      'voltage_l1',
      'current_l1',
      'timestamp',
    ];

    for (const field of requiredFields) {
      if (data[field] == null) {
        // Check for null or undefined
        console.error(`Invalid message: Missing required field ${field}`);
        return false;
      }
    }

    return true;
  }

  async handleMessage(data: any) {
    try {
      if (!this.validateMessage(data)) {
        console.error('Invalid message:', data);
        return;
      }

      // Process the message
      await this.saveEarnEProperty(data);
    } catch (error) {
      console.error('Error handling message:', error);
      throw error;
    }
  }

  async saveEarnEProperty(data: any) {
    // Find property that has the deviceId set as the pairingCode
    const property = await this.propertyRepository.findOne({
      where: { pairingCode: data.deviceId },
    });

    // if (!property) {
    //   console.error('Property not found for deviceId:', data.deviceId);
    //   console.error('Skipping message:', data);
    //   return;
    // } else {
    //   console.log('Property found for deviceId:', data.deviceId);
    //   console.log('Data:', data);
    // }
    if (!property) {
      return;
    }

    // Find the last record for this property with the same deviceId
    const lastRecord = await this.earnEPropertyRepository.findOne({
      where: { property: { id: property.id }, deviceId: data.deviceId },
      order: { timestamp: 'DESC' },
    });

    let energyDeliveredTariff1Difference = null;
    let energyDeliveredTariff2Difference = null;
    let energyReturnedTariff1Difference = null;
    let energyReturnedTariff2Difference = null;
    let gasDeliveredDifference = null;

    if (lastRecord) {
      energyDeliveredTariff1Difference =
        data.energy_delivered_tariff1 - lastRecord.energyDeliveredTariff1;
      energyDeliveredTariff2Difference =
        data.energy_delivered_tariff2 - lastRecord.energyDeliveredTariff2;
      energyReturnedTariff1Difference =
        data.energy_returned_tariff1 - lastRecord.energyReturnedTariff1;
      energyReturnedTariff2Difference =
        data.energy_returned_tariff2 - lastRecord.energyReturnedTariff2;
      gasDeliveredDifference = data.gas_delivered - lastRecord.gasDelivered;
    }

    // Create a new EarnEProperty entity
    const earnEProperty = this.earnEPropertyRepository.create({
      swVersion: data.swVersion,
      deviceId: data.deviceId,
      geo: data.geo,
      model: data.model,
      wifiRSSI: data.wifiRSSI,
      energyDeliveredTariff1: data.energy_delivered_tariff1,
      energyDeliveredTariff2: data.energy_delivered_tariff2,
      energyReturnedTariff1: data.energy_returned_tariff1,
      energyReturnedTariff2: data.energy_returned_tariff2,
      gasDelivered: data.gas_delivered,
      energyDeliveredTariff1Difference,
      energyDeliveredTariff2Difference,
      energyReturnedTariff1Difference,
      energyReturnedTariff2Difference,
      gasDeliveredDifference,
      powerDelivered: data.power_delivered,
      powerReturned: data.power_returned,
      voltageL1: data.voltage_l1,
      voltageL2: data.voltage_l2,
      voltageL3: data.voltage_l3,
      currentL1: data.current_l1,
      currentL2: data.current_l2,
      currentL3: data.current_l3,
      timestamp: new Date(data.timestamp).toLocaleString('en-US', {
        timeZone: 'Europe/Amsterdam',
      }),
      property: property,
    });

    await this.earnEPropertyRepository.save(earnEProperty);
  }
}
