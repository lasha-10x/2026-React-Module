import Eyebrow from './Eyebrow';
export default function PageHeader({ eyebrow, title, as: Heading = 'h1', children }) {
    return (<div className="flex flex-col gap-6 border-b border-wine-900/15 pb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <Eyebrow className="text-wine-600">{eyebrow}</Eyebrow>
        <Heading className="mt-4 font-sans text-3xl font-bold tracking-wide text-wine-900 uppercase lg:text-[2.5rem]">
          {title}
        </Heading>
      </div>
      {children}
    </div>);
}
