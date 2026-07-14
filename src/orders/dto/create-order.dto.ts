import { IsArray, IsPhoneNumber, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsUUID() productId: string;
  quantity: number;
}

export class CreateOrderDto {
  @IsUUID() wholesalerId: string;
  @IsPhoneNumber('KE') buyerPhone: string; // e.g. +254712345678

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
