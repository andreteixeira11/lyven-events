import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

export const useResponsiveDimensions = () => {
  const widthScale = SCREEN_WIDTH / BASE_WIDTH;
  const heightScale = SCREEN_HEIGHT / BASE_HEIGHT;

  const scale = (size: number, based: 'width' | 'height' = 'width') => {
    const newSize = based === 'height' ? size * heightScale : size * widthScale;
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  };

  const verticalScale = (size: number) => {
    return scale(size, 'height');
  };

  const moderateScale = (size: number, factor = 0.5) => {
    return Math.round(size + (scale(size) - size) * factor);
  };

  const wp = (percentage: number) => {
    return (SCREEN_WIDTH * percentage) / 100;
  };

  const hp = (percentage: number) => {
    return (SCREEN_HEIGHT * percentage) / 100;
  };

  return {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    scale,
    verticalScale,
    moderateScale,
    wp,
    hp,
    isSmallDevice: SCREEN_WIDTH < 375,
    isMediumDevice: SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414,
    isLargeDevice: SCREEN_WIDTH >= 414,
    isShortDevice: SCREEN_HEIGHT < 700,
  };
};

export const responsiveFontSize = (size: number) => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export const responsiveHeight = (height: number) => {
  const scale = SCREEN_HEIGHT / BASE_HEIGHT;
  return height * scale;
};

export const responsiveWidth = (width: number) => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  return width * scale;
};
