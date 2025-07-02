// src/utils/queryBuilder.js

/**
 * In‐memory query builder with indexing, filtering, sorting, and pagination.
 */
class QueryBuilder {
  constructor(data) {
    this.data = data;
    this.filters = [];
    this.sortOptions = null;
    this.paginationOptions = null;
    this.indexes = {};
  }

  buildIndexes(indexConfig) {
    Object.entries(indexConfig).forEach(([field, type]) => {
      if (type === 'hash') {
        // exact‐match hash index
        const idx = new Map();
        this.data.forEach((item, i) => {
          const v = item[field];
          if (!idx.has(v)) idx.set(v, []);
          idx.get(v).push(i);
        });
        this.indexes[field] = { type, index: idx };
      } else if (type === 'range') {
        // numeric range index via sorted list
        const sorted = [...this.data.keys()].sort(
          (a, b) => this.data[a][field] - this.data[b][field]
        );
        this.indexes[field] = { type, sortedIndices: sorted };
      }
    });
    return this;
  }

  where(condition) {
    // support simple object shorthand or custom function
    if (typeof condition === 'function') {
      this.filters.push(condition);
    } else {
      Object.entries(condition).forEach(([field, cond]) => {
        if (typeof cond === 'object') {
          Object.entries(cond).forEach(([op, val]) => {
            switch (op) {
              case '$eq':
                this.filters.push(item => item[field] === val);
                break;
              case '$contains':
                this.filters.push(item =>
                  String(item[field]).toLowerCase().includes(String(val).toLowerCase())
                );
                break;
              case '$gt':
                this.filters.push(item => item[field] > val);
                break;
              case '$lt':
                this.filters.push(item => item[field] < val);
                break;
              // add more operators as needed…
              default:
                this.filters.push(item => item[field] === cond);
            }
          });
        } else {
          this.filters.push(item => item[field] === cond);
        }
      });
    }
    return this;
  }

  range(field, min, max) {
    this.filters.push(item => item[field] >= min && item[field] <= max);
    return this;
  }

  sort(fields, direction = 'asc') {
    this.sortOptions = {
      fields: Array.isArray(fields) ? fields : [fields],
      direction
    };
    return this;
  }

  paginate(page, limit) {
    this.paginationOptions = {
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10
    };
    return this;
  }

  execute() {
    // naive filtering/sorting/paging (you can optimize further with indexes)
    let result = this.data;
    this.filters.forEach(fn => (result = result.filter(fn)));

    if (this.sortOptions) {
      const { fields, direction } = this.sortOptions;
      result.sort((a, b) => {
        for (const f of fields) {
          if (a[f] < b[f]) return direction === 'asc' ? -1 : 1;
          if (a[f] > b[f]) return direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    const total = result.length;
    if (this.paginationOptions) {
      const { page, limit } = this.paginationOptions;
      const start = (page - 1) * limit;
      result = result.slice(start, start + limit);
      return {
        data: result,
        metadata: { total, page, limit, pages: Math.ceil(total / limit) }
      };
    }

    return { data: result, metadata: null };
  }
}

module.exports = { QueryBuilder };
