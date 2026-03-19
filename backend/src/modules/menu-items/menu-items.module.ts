import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItemsController } from './menu-items.controller';
import { MenuItemsService } from './menu-items.service';
import { MenuItem } from '../../entities/menu-item.entity';
import { MenuGroup } from '../../entities/menu-group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MenuItem, MenuGroup])],
  controllers: [MenuItemsController],
  providers: [MenuItemsService],
  exports: [MenuItemsService],
})
export class MenuItemsModule {}
