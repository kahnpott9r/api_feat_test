import { Tenant } from '../tenants/entities/tenant.entity';
import { ROLE, UserRole } from '../user_roles/entities/user_role.entity';
import * as dotenv from 'dotenv';
import { PageOptionsDto } from 'src/pagination/dtos';
import { BadRequestException } from '@nestjs/common/exceptions';
import { EntityMetadata, ILike } from 'typeorm';
import * as moment from 'moment';
import { i18nValidationMessage } from 'nestjs-i18n';
import { User } from '../users/entities/user.entity';

dotenv.config();
export const isAllowedTenantByManager = (
  userRoles: UserRole[],
  tenantId: number,
) => {
  return userRoles.some(
    (item) => item.tenant.id === tenantId && item.role === ROLE.MANAGER,
  );
};
export const defaultAuthenticationValidation = (
  allowedRoles: ROLE[],
  user: User,
) => {
  if (allowedRoles.length == 0) {
    return false;
  }

  if (isAdmin(user.user_roles)) {
    return true;
  }

  if (
    !user.user_roles.some((userRole: UserRole) =>
      allowedRoles.includes(userRole.role),
    )
  ) {
    return false;
  }
  return undefined;
};

export enum DURATION {
  Hour = 'time',
  Today = 'today',
  Day = 'date',
  Week = 'week',
  Month = 'month',
  Quarter = 'quarter',
  Year = 'year',
}

export enum ATACHMENT_TYPE {
  IMAGE = 'image',
  FILE = 'file',
}

export const isAllowedTenant = (
  userRoles: UserRole[],
  tenant: Tenant,
  roleCheck: ROLE[],
) => {
  return userRoles.some(
    (item) => item.tenant.id === tenant.id && roleCheck.includes(item.role),
  );
};

export const isAllowedUser = (userRoles: UserRole[], roles: UserRole[]) => {
  return roles.some((role) => {
    return userRoles.some(
      (item) => item.tenant.id === role.tenant.id && item.role === ROLE.MANAGER,
    );
  });
};

export const isAllowedTenantArray = (
  userRoles: UserRole[],
  tenants: Tenant[],
  roleCheck: ROLE[],
) => {
  return tenants.every((item) => isAllowedTenant(userRoles, item, roleCheck));
};

export const isAdmin = (userRoles: UserRole[]) => {
  if (!userRoles) return false;
  return userRoles.some((item) => item.role === ROLE.ADMIN);
};

export const isManager = (userRoles: UserRole[]) => {
  if (!userRoles) return false;
  return userRoles.some((item) => item.role === ROLE.MANAGER);
};

export const getPaginationKeys = (pageDto: any) => {
  return Object.keys(pageDto);
};

export const getSortKey = (key: string) => {
  if (key.indexOf('sort') < 0) {
    return null;
  }
  return key.split(':')[1];
};

export const configQuery = (
  entity: string,
  pageDtoKeys: string[],
  entityFields: string[],
  pageOptionsDto: PageOptionsDto,
  entityMeta: EntityMetadata,
  query: any,
  allowUnpaginated = false,
  customSorts?: Record<string, string | ((key: string, direction: 'ASC' | 'DESC', entityAlias: string) => { sortProperty: string; sortDirection: 'ASC' | 'DESC' })>
) => {
  const allowedKeys = ['page', 'take', 'paginate', 'order', 'search'];
  const processedKeys = new Set<string>();
  let sortKey = null;
  
  // console.log(`[configQuery] Processing query for entity: ${entity}`);
  // console.log(`[configQuery] Page DTO keys:`, pageDtoKeys);
  
  // Define entitySearchFields for text search
  const entitySearchFields = [];
  entityMeta.columns.forEach((col) => {
    if (col.type.toString() === 'function String() { [native code] }') {
      entitySearchFields.push({
        alias: entity,
        field: col.propertyName,
      });
    }
  });

  const joinedRelations = query.expressionMap.joinAttributes.map(
    (join) => join.alias.name,
  );
  entityMeta.relations
    .filter((relation) => joinedRelations.includes(relation.propertyName))
    .forEach((relation) => {
      if (relation.inverseEntityMetadata) {
        relation.inverseEntityMetadata.columns.forEach((col) => {
          if (col.type.toString() === 'function String() { [native code] }') {
            entitySearchFields.push({
              alias: relation.propertyName,
              field: col.propertyName,
            });
          }
        });
      }
    });
    
  // Check for paginate validation
  if (
    pageDtoKeys.includes('paginate') &&
    pageOptionsDto.paginate !== '' &&
    allowUnpaginated
  ) {
    if (!pageDtoKeys.includes('take') || !pageDtoKeys.includes('page')) {
      throw new BadRequestException('Page or take missing');
    }
  }
  
  // Process match mode keys first to avoid duplicate processing
  pageDtoKeys.forEach((pageKey) => {
    // Check if it's a match mode key (contains ':')
    if (pageKey.includes(':') && !pageKey.startsWith('sort:')) {
      const [field, matchMode] = pageKey.split(':');
      // Mark the base field as processed to avoid duplicate processing
      processedKeys.add(field);
      
      // Validate that the field exists
      if (!allowedKeys.includes(field) && !entityFields.some((item) => item === field)) {
        throw new BadRequestException(
          i18nValidationMessage('message.QueryKeyInvalid'),
        );
      }
    }
  });
  
  pageDtoKeys.forEach((pageKey) => {
    // Handle sort keys
    if (getSortKey(pageKey)) {
      sortKey = getSortKey(pageKey);
      // Don't modify pageKey here, just save sortKey for later
      return;
    }
    
    // Handle match mode keys (like field:contains)
    if (pageKey.includes(':') && !pageKey.startsWith('sort:')) {
      const [field, matchMode] = pageKey.split(':');
      
      // Skip if this field is allowed without validation
      if (!allowedKeys.includes(field) && !entityFields.some((item) => item === field)) {
        throw new BadRequestException(
          i18nValidationMessage('message.QueryKeyInvalid'),
        );
      }
      
      const value = getValue(`${field}:${matchMode}`, pageOptionsDto);
      
      // Apply appropriate filtering based on match mode
      switch (matchMode) {
        case 'contains':
          query = query.andWhere(`${entity}.${field} ILIKE :${field}Value`, { 
            [`${field}Value`]: `%${value}%` 
          });
          break;
        case 'equals':
          query = query.andWhere(`${entity}.${field} = :${field}Value`, { 
            [`${field}Value`]: value 
          });
          break;
        case 'exists':
          if (value === 'true' || value === true) {
            query = query.andWhere(`${entity}.${field} IS NOT NULL`);
          } else {
            query = query.andWhere(`${entity}.${field} IS NULL`);
          }
          break;
        case 'in':
          // Handle array values for IN operator
          const inValues = Array.isArray(value) ? value : value.toString().split(',');
          query = query.andWhere(`${entity}.${field} IN (:...${field}Values)`, {
            [`${field}Values`]: inValues,
          });
          break;
        case 'dateBefore':
          query = query.andWhere(`${entity}.${field} <= :${field}Value`, {
            [`${field}Value`]: value,
          });
          break;
        case 'dateAfter':
          query = query.andWhere(`${entity}.${field} >= :${field}Value`, {
            [`${field}Value`]: value,
          });
          break;
        case 'dateBetween':
          // Handle date range with array of 2 dates or comma-separated string
          if (Array.isArray(value) && value.length === 2) {
            query = query.andWhere(`${entity}.${field} BETWEEN :${field}Start AND :${field}End`, {
              [`${field}Start`]: value[0],
              [`${field}End`]: value[1],
            });
          } else if (typeof value === 'string' && value.includes(',')) {
            const [startDate, endDate] = value.split(',');
            query = query.andWhere(`${entity}.${field} BETWEEN :${field}Start AND :${field}End`, {
              [`${field}Start`]: startDate,
              [`${field}End`]: endDate,
            });
          }
          break;
        default:
          // Default to exact match for unknown match modes
          query = query.andWhere(`${entity}.${field} = :${field}Value`, { 
            [`${field}Value`]: value 
          });
      }
      
      // Continue to next key since we've handled this one
      return;
    }
    
    // Skip already processed keys (match mode keys)
    if (processedKeys.has(pageKey)) {
      return;
    }
    
    // Validate the key
    if (
      !allowedKeys.includes(pageKey) &&
      !entityFields.some((item) => item === pageKey)
    ) {
      throw new BadRequestException(
        i18nValidationMessage('message.QueryKeyInvalid'),
      );
    }
    
    // Handle standard parameters as before
    if (pageKey == 'page') {
      if (!(allowUnpaginated && pageOptionsDto.paginate === 'false')) {
        query = query.skip(PageOptionsDto.skip(pageOptionsDto));
      }
    } else if (pageKey == 'take') {
      if (!(allowUnpaginated && pageOptionsDto.paginate === 'false')) {
        query = query.take(pageOptionsDto.take);
      }
    } else if (getSearchKey(pageKey)) {
      const searchKey = pageKey;
      const searchValue = getValue(searchKey, pageOptionsDto);
      const searchConditions = entitySearchFields
        .map(({ alias, field }) => {
          if (field === 'created_at' || field === 'updated_at') {
            return null;
          }
          return `${alias}.${field} ILIKE :searchValue`;
        })
        .filter((condition) => condition !== null);

      if (searchConditions.length > 0) {
        query = query.andWhere(`(${searchConditions.join(' OR ')})`, {
          searchValue: `%${searchValue}%`,
        });
      }
    } else if (pageKey == 'order') {
      // Skip, handled elsewhere
    } else if (pageKey == 'paginate') {
      // Skip, handled elsewhere
    } else {
      // Standard exact match for fields without match mode
      query = query.andWhere(`${entity}.${pageKey} = :${pageKey}Value`, {
        [`${pageKey}Value`]: getValue(pageKey, pageOptionsDto),
      });
    }
  });
  
  // Apply sorting if a sort key was found
  if (sortKey) {
    const sortDirection = getValue(`sort:${sortKey}`, pageOptionsDto) as 'ASC' | 'DESC';

    if (customSorts && customSorts[sortKey]) {
      const customMapping = customSorts[sortKey];
      if (typeof customMapping === 'string') {
        // Simple rename: sort by entity.renamedColumn
        query = query.orderBy(`${entity}.${customMapping}`, sortDirection);
      } else if (typeof customMapping === 'function') {
        // Complex expression: addSelect with an alias, then order by that alias
        const customSortResult = customMapping(sortKey, sortDirection, entity);
        const RANDOMLY_GENERATED_ALIAS = `_custom_sort_${sortKey.replace(/[^a-zA-Z0-9_]/g, '_')}`;
        query = query.addSelect(customSortResult.sortProperty, RANDOMLY_GENERATED_ALIAS);
        query = query.orderBy(RANDOMLY_GENERATED_ALIAS, customSortResult.sortDirection);
      }
    } else {
      // Default: sort by entity.column
      query = query.orderBy(`${entity}.${sortKey}`, sortDirection);
    }
  }

  // After processing all keys, log the final query for debugging
  // console.log(`[configQuery] Final query:`, query.getSql());
  
  return query;
};

export const getSearchKey = (key: string) => {
  if (key.indexOf('search') < 0) {
    return false;
  }
  return true;
};

export const getValue = (key: string, pageDto: any) => {
  return pageDto[key];
};

export const getStartAndEndDate = (duration: string, param: any) => {
  let startDate = null;
  let endDate = null;
  let interval = null;
  try {
    if (duration == DURATION.Month) {
      const paramList = param.split('-');
      const paramMomentS = moment(paramList[0], 'YYYY').month(
        parseInt(paramList[1]) - 1,
      );
      startDate = paramMomentS.startOf('month');
      const paramMomentE = moment(paramList[0], 'YYYY').month(
        parseInt(paramList[1]) - 1,
      );
      endDate = paramMomentE.endOf('month');
      interval = 'month';
    } else if (duration == DURATION.Quarter) {
      const paramList = param.split('-');
      const paramMomentS = moment(paramList[0], 'YYYY').quarter(
        parseInt(paramList[1].replace('Q', '')),
      );
      startDate = paramMomentS.startOf('quarter');
      const paramMomentE = moment(paramList[0], 'YYYY').quarter(
        parseInt(paramList[1].replace('Q', '')),
      );
      endDate = paramMomentE.endOf('quarter');
      interval = 'quarter';
    } else if (duration == DURATION.Year) {
      const paramMomentS = moment(param, 'YYYY');
      startDate = paramMomentS.startOf('year');
      const paramMomentE = moment(param, 'YYYY');
      endDate = paramMomentE.endOf('year');
      interval = 'year';
    } else if (duration == DURATION.Day) {
      const paramMomentS = moment(param, 'YYYY-MM-DD');
      startDate = paramMomentS.startOf('day');
      const paramMomentE = moment(param, 'YYYY-MM-DD');
      endDate = paramMomentE.endOf('day');
      interval = 'day';
    } else if (duration == DURATION.Week) {
      const paramMomentS = moment(param, 'YYYY-WW');
      startDate = paramMomentS.startOf('week');
      const paramMomentE = moment(param, 'YYYY-WW');
      endDate = paramMomentE.endOf('week');
      interval = 'week';
    } else if (duration == DURATION.Hour) {
      const paramMomentS = moment(param, 'YYYY-MM-DD HH:mm');
      startDate = paramMomentS.startOf('hour');
      const paramMomentE = moment(param, 'YYYY-MM-DD HH:mm');
      endDate = paramMomentE.endOf('hour');
      interval = 'hour';
    }
  } catch (e) {
    throw new BadRequestException(
      i18nValidationMessage('message.InvalidParams'),
    );
  }
  return {
    startDate,
    endDate,
    interval,
  };
};
