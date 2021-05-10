import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './orders.entity';
import { Repository } from 'typeorm';
import { CreateOrdersDto } from './create-orders.dto';
import { UpdateOrdersDto } from './update-orders.dto';
import { stat } from 'fs';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  findAll() {
    return this.orderRepository.find();
  }

  async findOne(id: string) {
    const order = await this.orderRepository.findOne(id);
    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }
    return order;
  }

  create(createOrderDto: CreateOrdersDto) {
    const order = this.orderRepository.create(createOrderDto);

    const { status } = createOrderDto;

    // Incomplete status validation
    if (status != 'Order accepted') {
      throw new HttpException(
        'Status has not correct form',
        HttpStatus.BAD_REQUEST,
      );
    }

    /*&& status != 'Preparing' &&
    status != 'Ready for deliving' || status != 'In delvered' ||
    status != 'Delivered'*/

    return this.orderRepository.save(order);
  }

  async update(id: string, updateOrderDto: UpdateOrdersDto) {
    const order = await this.orderRepository.preload({
      id: +id,
      ...updateOrderDto,
    });
    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }
    return this.orderRepository.save(order);
  }

  async remove(id: string) {
    const order = await this.findOne(id);
    return this.orderRepository.remove(order);
  }
}
