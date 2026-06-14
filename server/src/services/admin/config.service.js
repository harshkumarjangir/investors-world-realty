import prisma from '../../utils/prisma.js';

// ─── Property Categories ──────────────────────────────────────────────────────

export async function listPropertyCategories() {
  return prisma.propertyCategory.findMany({ orderBy: { name: 'asc' } });
}

export async function createPropertyCategory(name) {
  return prisma.propertyCategory.create({ data: { name } });
}

export async function updatePropertyCategory(id, name) {
  return prisma.propertyCategory.update({ where: { id }, data: { name } });
}

export async function deletePropertyCategory(id) {
  return prisma.propertyCategory.delete({ where: { id } });
}

// ─── Geographic Data ──────────────────────────────────────────────────────────

export async function listStates() {
  return prisma.masterState.findMany({ orderBy: { name: 'asc' } });
}

export async function createState(name) {
  return prisma.masterState.create({ data: { name } });
}

export async function listCities(stateId) {
  return prisma.masterCity.findMany({ where: stateId ? { stateId } : {}, orderBy: { name: 'asc' } });
}

export async function createCity(name, stateId) {
  return prisma.masterCity.create({ data: { name, stateId } });
}

// ─── Admin Roles ──────────────────────────────────────────────────────────────

export async function listAdminRoles() {
  return prisma.adminRole.findMany({ orderBy: { name: 'asc' } });
}

export async function createAdminRole(name, permissions) {
  return prisma.adminRole.create({ data: { name, permissions } });
}

export async function updateAdminRole(id, data) {
  const role = await prisma.adminRole.findUnique({ where: { id } });
  if (!role) throw Object.assign(new Error('Role not found'), { statusCode: 404 });
  return prisma.adminRole.update({ where: { id }, data });
}

export async function deleteAdminRole(id) {
  const inUse = await prisma.admin.count({ where: { roleId: id } });
  if (inUse > 0) throw Object.assign(new Error('Cannot delete role assigned to active admins'), { statusCode: 400 });
  return prisma.adminRole.delete({ where: { id } });
}

export async function renameState(id, name) {
  return prisma.masterState.update({ where: { id }, data: { name } });
}

export async function deleteState(id) {
  const cities = await prisma.masterCity.count({ where: { stateId: id } });
  if (cities > 0) {
    throw Object.assign(
      new Error(`Cannot delete state with ${cities} cities. Delete cities first.`),
      { statusCode: 400 },
    );
  }
  return prisma.masterState.delete({ where: { id } });
}

export async function renameCity(id, name) {
  return prisma.masterCity.update({ where: { id }, data: { name } });
}

export async function deleteCity(id) {
  return prisma.masterCity.delete({ where: { id } });
}
