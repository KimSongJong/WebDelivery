import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuGroupsController } from './menu-groups.controller';
import { MenuGroupsService } from './menu-groups.service';
import { MenuGroup } from '../../entities/menu-group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MenuGroup])],
  controllers: [MenuGroupsController],
  providers: [MenuGroupsService],
  exports: [MenuGroupsService],
})
export class MenuGroupsModule {}
