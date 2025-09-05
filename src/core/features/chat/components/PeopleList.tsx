'use client';

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
    <div className="py-6 grid grid-cols-[repeat(auto-fit,176px)] justify-center gap-x-2 gap-y-8">
      {people.map((p) => (
        <PersonCard
          {...(p as PersonCardData)}
          currentPersonId={currentPersonId}
          onSelect={onSelect}
          key={p._id}
        />
      ))}
    </div>
  );
};

PeopleList.displayName = 'PeopleList';

export default PeopleList;
