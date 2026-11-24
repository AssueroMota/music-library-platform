import type { Node, SourceFile } from 'typescript'

export function transformSiteMessages(
  code: string,
  filename: string,
  lookup: (message: string, kind: string, node: Node, source: SourceFile) => string | undefined,
): string
