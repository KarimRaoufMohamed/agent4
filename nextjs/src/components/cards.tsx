import {
  Card,
  DynamicCardsComponent,
  StaticCardsComponent,
} from "@/types/screens";
import Image from "next/image";
import {
  Card as ShadcnCard,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import Link from "next/link";
import DefaultImage from "../../public/default.jpg";
import ReportImage from "../../public/report_image.png";
import { formatDate, isValidDate } from "@/utils/format-date";
import { currentUser } from "@clerk/nextjs/server";
import { ChevronRight, ClipboardMinus } from "lucide-react";

type CardsProps = StaticCardsComponent | DynamicCardsComponent;

const formatTitle = (title: string): string => {
  if (!title) return '';
  
  // Replace underscores with spaces and capitalize each word
  return title
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const Cards: React.FC<CardsProps> = async (props) => {
  let cardsData: Card[];

  if (props.type === "static") {
    // **Static Cards**
    cardsData = props.cards;
  } else {
    // **Dynamic Cards**
    const {
      card_description,
      card_id,
      card_image,
      card_title,
      redirect_link,
      table_name,
      api_url,
      filter_by_user_email,
    } = props;

    let responseData;

    if (filter_by_user_email) {
      const user = await currentUser();
      const response = await fetch(
        `${process.env.API_URL}${api_url}${table_name}/?email=${user?.emailAddresses[0].emailAddress}`
      );

      responseData = await response.json();
    } else {
      const response = await fetch(
        `${process.env.API_URL}${api_url}/${table_name}`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      responseData = await response.json();
      console.log(responseData);
    }

    if (!responseData.reports || responseData.reports.length === 0) {
      return (

        <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-md text-center">
          <div className="mb-3">
            <ClipboardMinus className="w-16 h-16 mx-auto text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No reports available</h3>
          <p className="text-gray-600 mb-6">
            It looks like there are no reports assigned to your user group yet.
          </p>
          
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-left">
            <h4 className="font-medium text-blue-800 mb-3">How to get access:</h4>
            <ul className="space-y-2 text-blue-700">
              <li className="flex items-start">
                <ChevronRight className="w-5 h-5 mr-2 mt-0.5 text-blue-500 flex-shrink-0" />
                <span>Open the <strong className="font-semibold">Django admin</strong> interface</span>
              </li>
              <li className="flex items-start">
                <ChevronRight className="w-5 h-5 mr-2 mt-0.5 text-blue-500 flex-shrink-0" />
                <span>Go to the <strong className="font-semibold">Reports Group</strong> table under the <strong className="font-semibold">Reports</strong> section</span>
              </li>
              <li className="flex items-start">
                <ChevronRight className="w-5 h-5 mr-2 mt-0.5 text-blue-500 flex-shrink-0" />
                <span>Add one or more reports, and assign them to the appropriate <strong className="font-semibold">User Group</strong></span>
              </li>
              <li className="flex items-start">
                <ChevronRight className="w-5 h-5 mr-2 mt-0.5 text-blue-500 flex-shrink-0" />
                <span>All users in that group will then have access to those reports</span>
              </li>
            </ul>
          </div>
          
          <p className="mt-6 text-sm text-gray-500">
            Contact your administrator if you need assistance.
          </p>
        </div>


      );
    }

    cardsData = responseData.reports.map((card: Card) => ({
      id: card[card_id as keyof Card],
      title: card[card_title as keyof Card],
      description: card[card_description as keyof Card],
      image: card[card_image as keyof Card],
      redirect_link: `${redirect_link}/${card[card_id as keyof Card] ?? ""}`,
    }));
  }

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {cardsData?.map((card, index: number) => (
        <Link key={index} href={card.redirect_link}>
          <ShadcnCard className="overflow-hidden h-full">
            <div className="relative mt-4 h-48 w-[90%] mx-auto">
              <Image
                src={
                  props.type === "dynamic" && props.report_image
                    ? ReportImage
                    : card.image
                    ? card.image
                    : DefaultImage
                }
                alt={card.title}
                layout="fill"
                objectFit="contain"
                className="rounded-md"
              />
            </div>
            <CardHeader>
              <CardTitle>
                {isValidDate(card.title) ? formatDate(card.title) : formatTitle(card.title)}
              </CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
          </ShadcnCard>
        </Link>
      ))}
    </div>
  );
};

export default Cards;