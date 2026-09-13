import { useWindowDimensions } from 'react-native';

export interface ResponsiveInfo {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  contentMaxWidth: number;
  horizontalPadding: number;
  columns: number;
}

export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowDimensions();

  const isDesktop = width >= 1024;
  const isTablet = width >= 600 && width < 1024;
  const isMobile = width < 600;

  const contentMaxWidth = isDesktop ? 1200 : isTablet ? 840 : 480;
  const horizontalPadding = isDesktop ? 48 : isTablet ? 32 : 16;
  const columns = isDesktop ? 3 : isTablet ? 2 : 1;

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    contentMaxWidth,
    horizontalPadding,
    columns,
  };
}
