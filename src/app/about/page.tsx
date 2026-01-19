import React from 'react';
import Image from 'next/image';

const AboutPage = () => {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-8">About Me</h1>

      <section className="mb-12">
        <p className="mb-6">
          I&apos;m Wayne, a Staff Software Engineer on the compute infrastructure team at LinkedIn. I build the reliability-critical parts of our Kubernetes platform that help big systems behave.
        </p>
        <p className="mb-6">
        When I&apos;m not thinking about clusters, I&apos;m usually behind a camera, on a racing sim rig, or training to get a little stronger. Yes, I spend an unreasonable amount of time cuddling my golden retriever, Wall-E.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Shots</h2>

        <figure className="relative">
          <Image
            src="/images/large/half_moon_bay_large.png"
            alt="Half Moon Bay"
            width={1600}
            height={1068}
            className="rounded-sm"
            sizes="(max-width: 768px) calc(100vw - 32px), 640px"
            quality={100}
            priority
          />
          <figcaption className="mt-2 text-sm text-zinc-600">
            Half Moon Bay
          </figcaption>
        </figure>

        <br/>
        <figure className="relative">
          <Image
            src="/images/large/wall_e_large.jpg"
            alt="Wall-E"
            width={1600}
            height={1068}
            className="rounded-sm"
            sizes="(max-width: 768px) calc(100vw - 32px), 640px"
            quality={100}
            priority
          />
          <figcaption className="mt-2 text-sm text-zinc-600">
            dearest Wall-E
          </figcaption>
        </figure>

        <br/>
        <figure className="relative">
          <Image
            src="/images/large/993_carrera_large.png"
            alt="993 Carrera"
            width={1600}
            height={1068}
            className="rounded-sm"
            sizes="(max-width: 768px) calc(100vw - 32px), 640px"
            quality={100}
            priority
          />
          <figcaption className="mt-2 text-sm text-zinc-600">
            993 Carrera
          </figcaption>
        </figure>

        <br/>
        <figure className="relative">
          <Image
            src="/images/large/992_gt3_large.jpg"
            alt="992 GT3"
            width={1600}
            height={1068}
            className="rounded-sm"
            sizes="(max-width: 768px) calc(100vw - 32px), 640px"
            quality={100}
            priority
          />
          <figcaption className="mt-2 text-sm text-zinc-600">
            992 GT3
          </figcaption>
        </figure>

        <br/>
        <figure className="relative">
          <Image
            src="/images/large/cervelo_s5_large.jpg"
            alt="Cervélo S5"
            width={1600}
            height={1068}
            className="rounded-sm"
            sizes="(max-width: 768px) calc(100vw - 32px), 640px"
            quality={100}
            priority
          />
          <figcaption className="mt-2 text-sm text-zinc-600">
            Cervélo S5
          </figcaption>
        </figure>
      </section>
    </div>
  );
};

export default AboutPage;
