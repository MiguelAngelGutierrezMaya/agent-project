/**
 * Generic paginated response model
 * @template T - Type of the data items
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit?: number;
  offset?: number;
}
