function parsePagination(query) {
  const page = query.page === undefined ? 1 : Number(query.page);
  const requestedLimit =
    query.limit === undefined ? 10 : Number(query.limit);

  if (
    !Number.isInteger(page) ||
    page <= 0 ||
    !Number.isInteger(requestedLimit) ||
    requestedLimit <= 0
  ) {
    return { error: "page and limit must be positive integers" };
  }

  const limit = Math.min(requestedLimit, 50);

  return { page, limit };
}

module.exports = {
  parsePagination,
};
