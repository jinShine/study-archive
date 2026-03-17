/* [File Path]: src/utils/wrapWithMetadata.ts
   [Copyright]: © nhcodingstudio 소유 */
export function wrapWithMetadata<T>(content: T) {
  return {
    data: content,
    timestamp: Date.now(),
    id: Math.random().toString(36).substring(2, 9),
  };
}
