import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Bookmark, Hash, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Switch } from '../../components/ui/switch';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { cn } from '../../components/ui/utils';

const targetIcons = {
  journal: Building2,
  topic: Bookmark,
  keyword: Hash,
  author: User,
};

const targetLabelKeys = {
  journal: 'label.journal',
  topic: 'label.topic',
  keyword: 'label.keyword',
  author: 'label.author',
};

export default function FollowDialog({
  open,
  onClose,
  options = [],
  onSelect,
}) {
  const { t } = useTranslation('follow');
  const [selected, setSelected] = React.useState('');
  const [notifyEnabled, setNotifyEnabled] = React.useState(true);

  // Reset to first option when dialog opens
  React.useEffect(() => {
    if (open && options.length > 0) {
      setSelected(options[0].type + ':' + options[0].id);
      setNotifyEnabled(true);
    }
  }, [open, options]);

  if (!options || options.length === 0) return null;

  const handleConfirm = () => {
    if (!selected) return;
    const option = options.find(
      (o) => o.type + ':' + o.id === selected,
    );
    if (option) {
      onSelect({ ...option, notifyEnabled });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-primary/10 text-foreground">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {t('dialog.title')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t('page.subtitle')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <RadioGroup
            value={selected}
            onValueChange={setSelected}
            className="gap-2"
          >
            {options.map((option) => {
              const key = option.type + ':' + option.id;
              const Icon = targetIcons[option.type] || Hash;
              return (
                <label
                  key={key}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                    selected === key
                      ? 'border-accent-blue bg-accent-blue/10'
                      : 'border-primary/10 bg-primary/5 hover:border-primary/20',
                  )}
                >
                  <RadioGroupItem value={key} className="sr-only" />
                  <div
                    className={cn(
                      'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
                      selected === key
                        ? 'bg-accent-blue/20 text-accent-blue'
                        : 'bg-primary/10 text-muted-foreground',
                    )}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground">
                      {option.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t(targetLabelKeys[option.type] || 'label.keyword')}
                    </div>
                  </div>
                </label>
              );
            })}
          </RadioGroup>

          {/* Notification toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-primary/10 bg-primary/5">
            <Label
              htmlFor="notify-toggle"
              className="text-sm font-medium text-foreground cursor-pointer"
            >
              {t('dialog.enableNotification')}
            </Label>
            <Switch
              id="notify-toggle"
              checked={notifyEnabled}
              onCheckedChange={setNotifyEnabled}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-primary/10 text-muted-foreground hover:text-foreground hover:bg-primary/10"
          >
            {t('button.cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selected}
            className="bg-accent-blue text-white hover:bg-accent-blue/90"
          >
            {t('button.follow')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
