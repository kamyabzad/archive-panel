export default function (filters) {
  let params = []

  for (const [filter, value] of Object.entries(filters)) {
    if (value) {
      params[filter] = value
    }
  }

  let query = ``

  for (const [filter, value] of Object.entries(params)) {
    query += `&${filter}=${value}`
  }

  return query
}
