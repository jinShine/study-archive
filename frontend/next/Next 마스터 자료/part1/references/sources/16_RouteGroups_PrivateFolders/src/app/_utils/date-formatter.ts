/**
 * 이 파일은 _(언더바)로 시작하는 폴더 안에 있으므로 브라우저에서 직접 접근할 수 없습니다.
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(date);
};
