import type { CSSProperties } from 'react'
import { Badge } from '@/components/ui/badge'
import guide from '@/data/objectives.json'
import { formatAmount, resourceSegments, type Requirement } from '@/lib/resources'

export function ResourceBadge({ requirement }: { requirement: Requirement }) {
  const { amount, resource, label } = requirement
  return <Badge variant="outline" className="resource-badge" style={{ '--resource-color': guide.resourceColors[resource] } as CSSProperties}>
    <span>{formatAmount(amount)} {resource}</span>
    {label && <span className="requirement-label">· {label}</span>}
  </Badge>
}

export function ResourceText({ text }: { text: string }) {
  return resourceSegments(text).map((segment, index) => segment.type === 'text'
    ? segment.text
    : <ResourceBadge key={index} requirement={segment.requirement} />)
}
