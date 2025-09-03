'use client';

import { CollectionIcon } from '@/core/components/icons/CollectionIcon';
import { PhotoIcon } from '@/core/components/icons/PhotoIcon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/core/components/ui/DropdownMenu';
import { CollectionMap } from '@/core/features/chat/types/person';
import { toProperTitle } from '@/core/utils';

interface SelectMediaCollectionProps {
  avalCollections: (keyof CollectionMap)[];
  onSelect: (key: string) => void;
}

const SelectMediaCollection = ({
  avalCollections,
  onSelect,
}: SelectMediaCollectionProps) => {
  const handleSelect = (key: string) => {
    // Prevent warning: "Blocked aria-hidden on an element because its descendant retained focus. This gives the browser a moment to blur the dropdown’s focus before hiding it."
    setTimeout(() => {
      onSelect(key);
    }, 50);
  };

  return (
    <div className="pointer-events-auto">
      {avalCollections.length ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              className="p-2 rounded-full bg-popover text-muted opacity-40 hover:opacity-100 trans-o cursor-pointer"
              title="Avaliable collections"
            >
              <CollectionIcon />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleSelect('all')} key="all">
              All photos
            </DropdownMenuItem>
            {avalCollections.map((colName) => (
              <DropdownMenuItem
                onClick={() => handleSelect(colName)}
                key={colName}
              >
                <PhotoIcon className="icon--menu" />
                {toProperTitle(colName)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
};

export default SelectMediaCollection;
