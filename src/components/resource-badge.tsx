import type { CSSProperties } from 'react'
import { Badge } from '@/components/ui/badge'
import guide from '@/data/objectives.json'
import { formatAmount, resourceSegments, type Requirement } from '@/lib/resources'

export function ResourceBadge({ requirement }: { requirement: Requirement }) {
  const { amount, resource } = requirement
  return <Badge className="resource-badge" style={{
    '--resource-color': guide.resourceColors[resource],
    '--resource-foreground': resource === 'EP' ? '#FFFFFF' : '#000000',
  } as CSSProperties}>
    <span>{formatAmount(amount)} {resource}</span>
  </Badge>
}

export function ResourceText({ text }: { text: string }) {
  return resourceSegments(text).map((segment, index) => segment.type === 'text'
    ? segment.text
    : <ResourceBadge key={index} requirement={segment.requirement} />)
}
