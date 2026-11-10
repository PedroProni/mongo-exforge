export type S3Config = {
  endpoint: string;
  public_endpoint: string;
  region: string;
  bucket: string;
  access_key_id: string;
  secret_access_key: string;
  force_path_style: boolean;
  auto_create_bucket: boolean;
};
