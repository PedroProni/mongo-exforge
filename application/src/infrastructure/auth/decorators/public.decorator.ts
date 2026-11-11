import { SetMetadata } from '@nestjs/common';
import { PUBLIC_ROUTE_KEY } from '@domain/constants/auth.constant';

export const Public = () => SetMetadata(PUBLIC_ROUTE_KEY, true);
