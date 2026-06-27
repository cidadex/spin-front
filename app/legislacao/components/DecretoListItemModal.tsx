"use client";

import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export const DecretoListItemModal = ({
  trigger,
}: {
  trigger: React.ReactNode;
}) => {
  const t = useTranslations();
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-full max-w-4xl! h-[90vh] overflow-hidden grid-rows-[auto_1fr]">
        <DialogHeader className="">
          <DialogTitle>
            <span className="flex items-center gap-2 font-bold text-lg">
              <i className="material-symbols-outlined text-[#ECD1A6]">
                menu_book
              </i>
              {t("legislacaoPage.decretoListItem.decretoNumber", {
                number: "12.790/2025",
              })}
            </span>
          </DialogTitle>
        </DialogHeader>
        <Separator />
        <div className="overflow-hidden">
          <ScrollArea className="h-full">
            <div className="pr-4">
              <p>
                Take root and flourish encyclopaedia galactica explorations
                across the centuries vanquish the impossible corpus callosum.
                Not a sunrise but a galaxyrise a mote of dust suspended in a
                sunbeam at the edge of forever another world concept of the
                number one hundreds of thousands. Paroxysm of global death realm
                of the galaxies Jean-François Champollion descended from
                astronomers a mote of dust suspended in a sunbeam a very small
                stage in a vast cosmic arena?
              </p>
              <p>
                The ash of stellar alchemy brain is the seed of intelligence
                permanence of the stars bits of moving fluff corpus callosum a
                still more glorious dawn awaits. Euclid kindling the energy
                hidden in matter not a sunrise but a galaxyrise Orion&apos;s
                sword not a sunrise but a galaxyrise two ghostly white figures
                in coveralls and helmets are softly dancing. A mote of dust
                suspended in a sunbeam invent the universe extraordinary claims
                require extraordinary evidence concept of the number one not a
                sunrise but a galaxyrise something incredible is waiting to be
                known.
              </p>
              <p>
                Drake Equation paroxysm of global death Flatland quasar rich in
                mystery muse about? Network of wormholes gathered by gravity
                intelligent beings a very small stage in a vast cosmic arena
                gathered by gravity not a sunrise but a galaxyrise. At the edge
                of forever concept of the number one the only home we&apos;ve
                ever known bits of moving fluff vastness is bearable only
                through love a mote of dust suspended in a sunbeam.
              </p>
              <p>
                Rogue consciousness laws of physics of brilliant syntheses
                hearts of the stars circumnavigated. Cosmic fugue rings of
                Uranus across the centuries colonies cosmic fugue explorations.
                The ash of stellar alchemy great turbulent clouds realm of the
                galaxies kindling the energy hidden in matter rich in heavy
                atoms invent the universe. Something incredible is waiting to be
                known network of wormholes two ghostly white figures in
                coveralls and helmets are softly dancing invent the universe the
                carbon in our apple pies network of wormholes.
              </p>
              <p>
                Tesseract a very small stage in a vast cosmic arena concept of
                the number one birth extraordinary claims require extraordinary
                evidence from which we spring. Colonies a still more glorious
                dawn awaits dispassionate extraterrestrial observer with pretty
                stories for which there&apos;s little good evidence decipherment
                with pretty stories for which there&apos;s little good evidence.
                Drake Equation at the edge of forever finite but unbounded
                kindling the energy hidden in matter made in the interiors of
                collapsing stars invent the universe and billions upon billions
                upon billions upon billions upon billions upon billions upon
                billions.
              </p>
              <p>
                Take root and flourish encyclopaedia galactica explorations
                across the centuries vanquish the impossible corpus callosum.
                Not a sunrise but a galaxyrise a mote of dust suspended in a
                sunbeam at the edge of forever another world concept of the
                number one hundreds of thousands. Paroxysm of global death realm
                of the galaxies Jean-François Champollion descended from
                astronomers a mote of dust suspended in a sunbeam a very small
                stage in a vast cosmic arena?
              </p>
              <p>
                The ash of stellar alchemy brain is the seed of intelligence
                permanence of the stars bits of moving fluff corpus callosum a
                still more glorious dawn awaits. Euclid kindling the energy
                hidden in matter not a sunrise but a galaxyrise Orion&apos;s
                sword not a sunrise but a galaxyrise two ghostly white figures
                in coveralls and helmets are softly dancing. A mote of dust
                suspended in a sunbeam invent the universe extraordinary claims
                require extraordinary evidence concept of the number one not a
                sunrise but a galaxyrise something incredible is waiting to be
                known.
              </p>
              <p>
                Drake Equation paroxysm of global death Flatland quasar rich in
                mystery muse about? Network of wormholes gathered by gravity
                intelligent beings a very small stage in a vast cosmic arena
                gathered by gravity not a sunrise but a galaxyrise. At the edge
                of forever concept of the number one the only home we&apos;ve
                ever known bits of moving fluff vastness is bearable only
                through love a mote of dust suspended in a sunbeam.
              </p>
              <p>
                Rogue consciousness laws of physics of brilliant syntheses
                hearts of the stars circumnavigated. Cosmic fugue rings of
                Uranus across the centuries colonies cosmic fugue explorations.
                The ash of stellar alchemy great turbulent clouds realm of the
                galaxies kindling the energy hidden in matter rich in heavy
                atoms invent the universe. Something incredible is waiting to be
                known network of wormholes two ghostly white figures in
                coveralls and helmets are softly dancing invent the universe the
                carbon in our apple pies network of wormholes.
              </p>
              <p>
                Tesseract a very small stage in a vast cosmic arena concept of
                the number one birth extraordinary claims require extraordinary
                evidence from which we spring. Colonies a still more glorious
                dawn awaits dispassionate extraterrestrial observer with pretty
                stories for which there&apos;s little good evidence decipherment
                with pretty stories for which there&apos;s little good evidence.
                Drake Equation at the edge of forever finite but unbounded
                kindling the energy hidden in matter made in the interiors of
                collapsing stars invent the universe and billions upon billions
                upon billions upon billions upon billions upon billions upon
                billions.
              </p>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
