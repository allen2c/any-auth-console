// app/console/components/tabs/index.ts

// Export tabs for easy importing
export { default as ServicesTab } from "./ServicesTab";
export { default as MembersTab } from "./MembersTab";
export { default as IAMTab } from "./IAMTab";
export { default as APIKeysTab } from "./APIKeysTab";
export { default as SettingsTab } from "./SettingsTab";

// Export modals for API Keys
export { default as CreateAPIKeyModal } from "./modals/CreateAPIKeyModal";
export { default as EditAPIKeyModal } from "./modals/EditAPIKeyModal";

// Export panels for API Keys
export { default as APIKeyRolesPanel } from "./panels/APIKeyRolesPanel";
