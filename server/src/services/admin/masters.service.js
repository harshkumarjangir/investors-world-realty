import prisma from '../../utils/prisma.js';

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
  const creates = images.filter((i) => i.imageUrl).map((i) => ({
    schemeId,
    imageUrl: i.imageUrl,
    slot: i.slot,
  }));
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

// ─── Plot (Flat/Plot/Shop) ────────────────────────────────────────────────────
export async function listPlots(filters, pagination) {
  const { schemeId } = filters;
  const { page, pageSize, skip, take } = pagination;
  const where = schemeId ? { schemeId } : {};
  const [items, totalItems] = await Promise.all([
    prisma.plot.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip, take,
      include: {
        scheme: { select: { schemeName: true } },
        plotType: { select: { typeName: true } },
      },
    }),
    prisma.plot.count({ where }),
  ]);
  return {
    items: items.map((p) => ({
      ...p,
      plotSize: Number(p.plotSize),
      totalCost: Number(p.totalCost),
      chargeOfPlot: Number(p.chargeOfPlot),
      totalCostOfPlot: Number(p.totalCostOfPlot),
      schemeName: p.scheme.schemeName,
      plotTypeName: p.plotType?.typeName || null,
    })),
    totalItems, page, pageSize,
  };
}

export async function createPlot(data) {
  const { schemeId, plotTypeId, plotSizeUnit, plotSize, totalCost, plotNo, plcId, chargeOfPlot, totalCostOfPlot } = data;
  return prisma.plot.create({
    data: {
      schemeId,
      plotTypeId: plotTypeId || null,
      plotSizeUnit: plotSizeUnit || null,
      plotSize: parseFloat(plotSize) || 0,
      totalCost: parseFloat(totalCost) || 0,
      plotNo: plotNo || '',
      plcId: plcId || null,
      chargeOfPlot: parseFloat(chargeOfPlot) || 0,
      totalCostOfPlot: parseFloat(totalCostOfPlot) || 0,
      status: 'Not Used',
    },
  });
}

export async function updatePlot(id, data) {
  const { schemeId, plotTypeId, plotSizeUnit, plotSize, totalCost, plotNo, plcId, chargeOfPlot, totalCostOfPlot, status } = data;
  return prisma.plot.update({
    where: { id },
    data: {
      schemeId,
      plotTypeId: plotTypeId || null,
      plotSizeUnit: plotSizeUnit || null,
      plotSize: parseFloat(plotSize) || 0,
      totalCost: parseFloat(totalCost) || 0,
      plotNo: plotNo || '',
      plcId: plcId || null,
      chargeOfPlot: parseFloat(chargeOfPlot) || 0,
      totalCostOfPlot: parseFloat(totalCostOfPlot) || 0,
      status: status || 'Not Used',
    },
  });
}

export async function deletePlot(id) {
  return prisma.plot.delete({ where: { id } });
}
