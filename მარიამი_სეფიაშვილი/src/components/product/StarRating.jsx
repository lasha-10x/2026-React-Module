import StarIcon from "./StarIcon";
const STARS = [1, 2, 3, 4, 5];
export default function StarRating({ rating }) {
    const rounded = Math.round(rating);
    return (<div className="flex gap-0.5" role="img" aria-label={`${rounded} out of 5 stars`}>
      {STARS.map((star) => (<StarIcon key={star} filled={star <= rounded}/>))}
    </div>);
}
