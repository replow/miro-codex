import { Icon as IconifyIcon, type IconProps } from '@iconify/react';
import { offlineIcons } from '@lib/offline-icons';

/** Render project icons from the local bundle, retaining Iconify API fallback for custom icons. */
export function Icon({ icon, ...props }: IconProps) {
  const localIcon = typeof icon === 'string' ? offlineIcons[icon] : icon;
  return <IconifyIcon icon={localIcon ?? icon} {...props} />;
}
