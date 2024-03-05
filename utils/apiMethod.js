class ApiMethod {
  constructor({ filter, limit, page, sort }) {
    (this.filter = filter),
      (this.limit = limit),
      (this.page = page),
      (this.sort = sort);
  }
}
