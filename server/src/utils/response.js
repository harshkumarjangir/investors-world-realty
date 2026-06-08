export function successResponse(res, data = null, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({ status: 'success', message, data });
}

export function createdResponse(res, data = null, message = 'Created successfully') {
  return res.status(200).json({ status: 'success', message, data });
}

export function errorResponse(res, message = 'An error occurred', statusCode = 400, code = null) {
  const body = { status: 'error', message, data: null };
  if (code) body.code = code;
  return res.status(statusCode).json(body);
}

export function paginatedResponse(res, items, totalItems, page, pageSize, message = 'Success') {
  const totalPages = Math.ceil(totalItems / pageSize);
  return res.status(200).json({
    status: 'success',
    message,
    data: items,
    currentPage: page,
    totalPages,
    totalItems,
    pageSize,
  });
}

export function parsePagination(query) {
  let page = parseInt(query.page, 10) || 1;
  let pageSize = parseInt(query.pageSize, 10) || 20;

  if (page < 1) page = 1;
  if (pageSize < 1) pageSize = 20;
  if (pageSize > 100) pageSize = 100;

  const skip = (page - 1) * pageSize;
  const take = pageSize;

  return { page, pageSize, skip, take };
}
