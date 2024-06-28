import { Exclude, Expose, Transform } from 'class-transformer';

export class ResponseRegResDto {
  @Expose()
  @Transform(({ obj }) => obj.data.id)
  readonly id: number;

  @Expose()
  @Transform(({ obj }) => obj.data.email)
  readonly email: string;

  @Expose()
  @Transform(({ obj }) => obj.data.first_name)
  readonly firstName: string;

  @Expose()
  @Transform(({ obj }) => obj.data.last_name)
  readonly lastName: string;

  @Expose()
  @Transform(({ obj }) => obj.data.avatar)
  readonly avatar: string;

  @Exclude()
  readonly support: any;

  @Exclude()
  readonly data: any;
}
