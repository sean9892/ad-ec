import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export function SettingsPanel({ autoAdvance, onAutoAdvanceChange, sessionOnly }: { autoAdvance: boolean; onAutoAdvanceChange: (checked: boolean) => void; sessionOnly: boolean }) {
  return <Dialog>
    <DialogTrigger render={<Button variant="ghost" className="copyright-button settings-button" />}><Settings size={16} aria-hidden="true" />Setting</DialogTrigger>
    <DialogContent className="copyright-dialog settings-panel">
      <DialogHeader>
        <DialogTitle>Setting</DialogTitle>
        <DialogDescription>Choose how you move through the guide.</DialogDescription>
      </DialogHeader>
      <div className="setting-row">
        <div>
          <label htmlFor="auto-advance">Automatic scroll-down</label>
          <p id="auto-advance-description">Move to the next objective when you mark one as achieved.</p>
        </div>
        <Switch id="auto-advance" checked={autoAdvance} onCheckedChange={onAutoAdvanceChange} aria-describedby="auto-advance-description" />
      </div>
      {sessionOnly && <p className="settings-storage-note" role="status">This setting is saved for this session only.</p>}
    </DialogContent>
  </Dialog>
}
