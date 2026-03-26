import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from '../../entities/order.entity';
import { OrderDetail } from '../../entities/order-detail.entity';
import { MenuItem } from '../../entities/menu-item.entity';
import { Voucher } from '../../entities/voucher.entity';
import { Payment } from '../../entities/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderDetail, MenuItem, Voucher, Payment])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
