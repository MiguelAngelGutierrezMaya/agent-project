/**
 * Config collection migrations
 *
 * @description
 * This module exports all migrations related to the config collections:
 * - client_configs: Used in the public database
 * - config: Used in tenant databases
 */

export { createClientConfigsCollectionMigration } from './001-create-client-configs-collection';
export { createConfigCollectionMigration } from './002-create-config-collection';
