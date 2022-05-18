# Serverless S3 Bucket Helper

This plugin sets settings on all S3 buckets. These are settings we generally want everywhere.

Currently,

- versioning is enabled for all buckets, regardless of configuration... non-negotiable
- public access is blocked via 'PublicAccessBlockConfiguration' by default.
- optionally, enable s3 server access logging for all buckets

## Usage

```yaml
plugins:
  - serverless-s3-bucket-helper

s3BucketHelper:
  # Optional setting for enabling s3 server access logging.
  loggingConfiguration:
    destinationBucketName: my-logging-bucket
    logFilePrefix: path/for/logs
```

## Background

This plugin hooks into the serverless lifecycle at "before:deploy:deploy". There, it looks for S3 buckets and potentially modifies each. Currently, versioning is enabled for all buckets and public access is blocked by default. Enabling S3 server access logging requires setting the optional `loggingConfiguration` for the top level `s3BucketHelper` property.
