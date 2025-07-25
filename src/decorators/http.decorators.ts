import type { PipeTransform } from '@nestjs/common';
import {
  applyDecorators,
  Param,
  ParseUUIDPipe,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Type } from '@nestjs/common/interfaces';
import {
  ApiBearerAuth,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuthGuard } from '../guards/auth.guard.ts';
import { RolesGuard } from '../guards/roles.guard.ts';
import { AuthUserInterceptor } from '../interceptors/auth-user-interceptor.service.ts';
import { PublicRoute } from './public-route.decorator.ts';
import { Roles } from './roles.decorator.ts';
import type { RoleType } from '../constants/role-type.ts';

export function Auth(
  roles: RoleType[] = [],
  options?: Partial<{ public: boolean }>,
): MethodDecorator {
  const isPublicRoute = options?.public;

  return applyDecorators(
    Roles(roles),
    UseGuards(AuthGuard({ public: isPublicRoute }), RolesGuard),
    ApiBearerAuth(),
    UseInterceptors(AuthUserInterceptor),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    PublicRoute(isPublicRoute),
  );
}

export function UUIDParam(
  property: string,
  ...pipes: Array<Type<PipeTransform> | PipeTransform>
): ParameterDecorator {
  return applyDecorators(
    ApiParam({
      name: property,
      type: String,
      format: 'uuid',
      description: `UUID parameter for ${property}`,
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    Param(property, new ParseUUIDPipe({ version: '4' }), ...pipes),
  );
}

export function StringParam(
  property: string,
  description?: string,
  ...pipes: Array<Type<PipeTransform> | PipeTransform>
): ParameterDecorator {
  return applyDecorators(
    ApiParam({
      name: property,
      type: String,
      description: description ?? `String parameter for ${property}`,
    }),
    Param(property, ...pipes),
  );
}
