import prisma from '../../utils/prisma.js';

// ─── Packages ─────────────────────────────────────────────────────────────────

export async function listPackages() {
  return prisma.package.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function createPackage(data) {
  const { name, price, benefits, directPercent } = data;
  return prisma.package.create({
    data: { name, price: Number(price), benefits: benefits || [], directPercent: Number(directPercent) },
  });
}

export async function updatePackage(id, data) {
  const pkg = await prisma.package.findUnique({ where: { id } });
  if (!pkg) throw Object.assign(new Error('Package not found'), { statusCode: 404 });
  return prisma.package.update({ where: { id }, data });
}

export async function deletePackage(id) {
  const inUse = await prisma.associate.count({ where: { packageId: id, deletedAt: null } });
  if (inUse > 0) throw Object.assign(new Error('Cannot delete package in use by active associates'), { statusCode: 400 });
  return prisma.package.delete({ where: { id } });
}

// ─── Income Plans ─────────────────────────────────────────────────────────────

export async function listIncomePlans() {
  return prisma.incomePlan.findMany({ orderBy: { type: 'asc' } });
}

export async function createIncomePlan(data) {
  return prisma.incomePlan.create({ data });
}

export async function updateIncomePlan(id, data) {
  const plan = await prisma.incomePlan.findUnique({ where: { id } });
  if (!plan) throw Object.assign(new Error('Income plan not found'), { statusCode: 404 });
  return prisma.incomePlan.update({ where: { id }, data });
}

export async function deleteIncomePlan(id) {
  return prisma.incomePlan.delete({ where: { id } });
}

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
