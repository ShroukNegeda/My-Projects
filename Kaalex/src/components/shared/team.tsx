import Image from "next/image";

const avatarSeeds = [47, 68, 45, 65, 33, 12, 25, 8];

export function Team({
  title,
  members,
}: {
  title: string;
  members: readonly { name: string; role: string }[];
}) {
  return (
    <section className="border-b border-border bg-bg-elevated py-20 sm:py-24">
      <div className="container-page">
        <h2 className="text-center font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
          {title}
        </h2>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {members.map((member, i) => (
            <div key={member.name} className="text-center">
              <div className="relative mx-auto aspect-square w-full max-w-[220px] overflow-hidden rounded-2xl bg-surface-2">
                <Image
                  src={`https://i.pravatar.cc/440?img=${avatarSeeds[i % avatarSeeds.length]}`}
                  alt={member.name}
                  fill
                  unoptimized
                  className="object-cover grayscale-[15%]"
                  sizes="220px"
                />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold text-text">
                {member.name}
              </h3>
              <p className="mt-1 text-sm text-text-muted">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
