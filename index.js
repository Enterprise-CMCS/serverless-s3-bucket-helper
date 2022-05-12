"use strict";

class ServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;

    serverless.configSchemaHandler.defineTopLevelProperty("s3BucketHelper", {
      type: "object",
      properties: {
        loggingConfiguration: {
          type: "object",
          properties: {
            destinationBucketName: { type: "string" },
            logFilePrefix: { type: "string" },
          },
        },
      },
    });

    this.hooks = {
      // This will configure all S3 buckets according to this plugin.
      "before:deploy:deploy": this.configureBuckets.bind(this),
    };
  }

  getPluginConfig() {
    return this.serverless.service.s3BucketHelper;
  }

  getLoggingConfiguration() {
    const config = this.getPluginConfig();
    return (
      config && {
        DestinationBucketName:
          config.loggingConfiguration.destinationBucketName,
        LogFilePrefix: config.loggingConfiguration.logFilePrefix,
      }
    );
  }

  configureBuckets() {
    // Forcibly enable versioning for all buckets.
    setPropertyForTypes.call(
      this,
      ["AWS::S3::Bucket"],
      "VersioningConfiguration",
      {
        Status: "Enabled",
      },
      true
    );

    // Block public access at the bucket level, unless explicitly set otherwise.  (SecurityHub S3.8)
    setPropertyForTypes.call(
      this,
      ["AWS::S3::Bucket"],
      "PublicAccessBlockConfiguration",
      {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
      false
    );

    // Add Logging Configuration configured for the plugin, if any, unless explicity set otherwise. (SecurityHub S3.9)
    const loggingConfiguration = this.getLoggingConfiguration();
    if (loggingConfiguration) {
      setPropertyForTypes.call(
        this,
        ["AWS::S3::Bucket"],
        "LoggingConfiguration",
        loggingConfiguration,
        false
      );
    }
  }
}

function setPropertyForTypes(types, property, value, overrideExistingValue) {
  [
    this.serverless.service.provider.compiledCloudFormationTemplate,
    this.serverless.service.provider.coreCloudFormationTemplate,
  ].forEach(function (template) {
    Object.keys(template.Resources).forEach(function (key) {
      if (types.includes(template.Resources[key]["Type"])) {
        // Set the target property to the target value... if it's not already set OR we want to override any existing value.
        if (
          !(property in template.Resources[key]["Properties"]) ||
          overrideExistingValue
        ) {
          template.Resources[key]["Properties"][property] = value;
        }
      }
    });
  });
}

module.exports = ServerlessPlugin;
