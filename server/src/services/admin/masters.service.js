import prisma from '../../utils/prisma.js';
import fs from 'fs';
import path from 'path';

// ─── Account Master ───────────────────────────────────────────────────────────
export async function listAccountMasters(pagination) {
  const { page, pageSize, skip, take } = pagination;
  const [items, totalItems] = await Promise.all([
    prisma.accountMaster.findMany({ orderBy: { createdAt: 'desc' }, skip, take }),
    prisma.accountMaster.count(),
  ]);
  return { items, totalItems, page, pageSize };
}

export async function createAccountMaster(data) {
  return prisma.accountMaster.create({ data });
}

export async function updateAccountMaster(id, data) {
  return prisma.accountMaster.update({ where: { id }, data });
}

export async function deleteAccountMaster(id) {
  return prisma.accountMaster.delete({ where: { id } });
}

// ─── Scheme ───────────────────────────────────────────────────────────────────
export async function listSchemes(pagination) {
  const { page, pageSize, skip, take } = pagination;
  const [items, totalItems] = await Promise.all([
    prisma.scheme.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      skip, take,
      include: { images: { orderBy: { slot: 'asc' } } },
    }),
    prisma.scheme.count({ where: { isActive: true } }),
  ]);
  return { items, totalItems, page, pageSize };
}

export async function getSchemeById(id) {
  const scheme = await prisma.scheme.findUnique({
    where: { id },
    include: { images: { orderBy: { slot: 'asc' } } },
  });
  if (!scheme) throw Object.assign(new Error('Scheme not found'), { statusCode: 404 });
  return scheme;
}

export async function createScheme(data) {
  const { images, ...schemeData } = data;
  return prisma.scheme.create({
    data: {
      ...schemeData,
      images: images && images.length > 0
        ? { create: images.map((img) => ({ imageUrl: img.imageUrl, slot: img.slot })) }
        : undefined,
    },
    include: { images: true },
  });
}

export async function updateScheme(id, data) {
  const { images, ...schemeData } = data;
  await prisma.schemeImage.deleteMany({ where: { schemeId: id } });
  return prisma.scheme.update({
    where: { id },
    data: {
      ...schemeData,
      images: images && images.length > 0
        ? { create: images.map((img) => ({ imageUrl: img.imageUrl, slot: img.slot })) }
        : undefined,
    },
    include: { images: true },
  });
}

export async function deleteScheme(id) {
  return prisma.scheme.update({ where: { id }, data: { isActive: false } });
}

// ─── Scheme Images ────────────────────────────────────────────────────────────
export async function upsertSchemeImages(schemeId, images) {
  // images = [{ slot: 1, imageUrl: '...' }, ...]
  await prisma.schemeImage.deleteMany({ where: { schemeId } });
  const creates = [];
  
  const schemeImagesDir = 'uploads/schemes';
  if (!fs.existsSync(schemeImagesDir)) {
    fs.mkdirSync(schemeImagesDir, { recursive: true });
  }

  for (const i of images.filter((i) => i.imageUrl)) {
    let finalUrl = i.imageUrl;
    if (finalUrl.startsWith('data:image')) {
      const matches = finalUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const ext = matches[1].split('/')[1] || 'png';
        const buffer = Buffer.from(matches[2], 'base64');
        const filename = `${schemeId}-${i.slot}-${Date.now()}.${ext}`;
        const filepath = path.join(schemeImagesDir, filename);
        fs.writeFileSync(filepath, buffer);
        finalUrl = `${schemeImagesDir}/${filename}`.replace(/\\/g, '/');
      }
    }
    creates.push({
      schemeId,
      imageUrl: finalUrl,
      slot: i.slot,
    });
  }
  if (creates.length > 0) {
    await prisma.schemeImage.createMany({ data: creates });
  }
  return prisma.schemeImage.findMany({ where: { schemeId }, orderBy: { slot: 'asc' } });
}

// ─── Plc Charge ───────────────────────────────────────────────────────────────
export async function listPlcCharges(pagination) {
  const { page, pageSize, skip, take } = pagination;
  const [items, totalItems] = await Promise.all([
    prisma.plcCharge.findMany({ orderBy: { createdAt: 'desc' }, skip, take }),
    prisma.plcCharge.count(),
  ]);
  return { items: items.map((i) => ({ ...i, plcCharge: Number(i.plcCharge) })), totalItems, page, pageSize };
}

export async function createPlcCharge(data) {
  return prisma.plcCharge.create({
    data: { plcName: data.plcName, chargeType: data.chargeType, plcCharge: parseFloat(data.plcCharge) || 0 },
  });
}

export async function updatePlcCharge(id, data) {
  return prisma.plcCharge.update({
    where: { id },
    data: { plcName: data.plcName, chargeType: data.chargeType, plcCharge: parseFloat(data.plcCharge) || 0 },
  });
}

export async function deletePlcCharge(id) {
  return prisma.plcCharge.delete({ where: { id } });
}

// ─── Plot Type ────────────────────────────────────────────────────────────────
export async function listPlotTypes(pagination) {
  const { page, pageSize, skip, take } = pagination;
  const [items, totalItems] = await Promise.all([
    prisma.plotType.findMany({ orderBy: { createdAt: 'desc' }, skip, take }),
    prisma.plotType.count(),
  ]);
  return { items, totalItems, page, pageSize };
}

export async function createPlotType(data) {
  return prisma.plotType.create({ data: { typeName: data.typeName } });
}

export async function updatePlotType(id, data) {
  return prisma.plotType.update({ where: { id }, data: { typeName: data.typeName } });
}

export async function deletePlotType(id) {
  return prisma.plotType.delete({ where: { id } });
}
