'use client';

import { ScrollArea, ScrollBar } from '@/core/components/ui/ScrollArea';
import PersonCard from '@/core/features/chat/components/PersonCard';
import {
  PersonCardData,
  SelectPerson,
} from '@/core/features/chat/types/person';

type TPeopleListProps = {
  people: PersonCardData[];
  currentPersonId: string;
  onSelect: (person: SelectPerson) => void;
};

const PeopleList = ({
  people,
  currentPersonId,
  onSelect,
}: TPeopleListProps) => {
  return (
    <ScrollArea className="people-list_wrapper">
      <div className="people-list">
        {people.map((p) => (
          <PersonCard
            {...(p as PersonCardData)}
            currentPersonId={currentPersonId}
            onSelect={onSelect}
            key={p._id}
          />
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

PeopleList.displayName = 'PeopleList';

export default PeopleList;
