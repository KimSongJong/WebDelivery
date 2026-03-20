import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuGroupsController } from './menu-groups.controller';
import { MenuGroupsService } from './menu-groups.service';
import { MenuGroup } from '../../entities/menu-group.entity';
import { Restaurant } from '../../entities/restaurant.entity';
import { MenuItem } from '../../entities/menu-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MenuGroup, Restaurant, MenuItem])],
  controllers: [MenuGroupsController],
  providers: [MenuGroupsService],
  exports: [MenuGroupsService],
})
export class MenuGroupsModule {}
