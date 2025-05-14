export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  include?: string[];
  [key: `filter[${string}]`]: string | number | undefined;
  [key: string]: string | number | string[] | undefined;
}
