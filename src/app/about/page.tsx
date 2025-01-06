import React from 'react';
import Image from 'next/image';

const AboutPage = () => {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-8">About Me</h1>

      <section className="mb-12">
        <p className="text-lg mb-6">
          I&apos;m a Staff Software Engineer working on compute infrastructure at LinkedIn. I&apos;m passionate about building distributed systems and designing scalable architectures.
        </p>
        <p className="text-lg mb-6">
          Outside of work, I enjoy photography, racing simulators, and pushing myself with cross-training workouts. Most importantly, I cuddle with my beloved golden retriever, Wall-E.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Shots</h2>

        <figure className="relative">
          <Image
            src="/images/medium/half_moon_bay_medium.png"
            alt="Half Moon Bay"
            width={1200}
            height={800}
            className="rounded-sm"
            sizes="(max-width: 768px) 100vw, 800px"
            quality={85}
            priority
          />
          <figcaption className="mt-2 text-sm text-zinc-600">
            Half Moon Bay
          </figcaption>
        </figure>

        <br/>
        <figure className="relative">
          <Image
            src="/images/medium/wall_e_medium.jpg"
            alt="Wall E"
            width={1200}
            height={800}
            className="rounded-sm"
            sizes="(max-width: 768px) 100vw, 800px"
            quality={85}
            priority
          />
          <figcaption className="mt-2 text-sm text-zinc-600">
            dearest Wall-E
          </figcaption>
        </figure>

        <br/>
        <figure className="relative">
          <Image
            src="/images/medium/993_carrera_medium.png"
            alt="993 Carrera"
            width={1200}
            height={800}
            className="rounded-sm"
            sizes="(max-width: 768px) 100vw, 800px"
            quality={85}
            priority
          />
          <figcaption className="mt-2 text-sm text-zinc-600">
            993 Carrera
          </figcaption>
        </figure>

        <br/>
        <figure className="relative">
          <Image
            src="/images/medium/992_gt3_medium.jpg"
            alt="992 GT3"
            width={1200}
            height={800}
            className="rounded-sm"
            sizes="(max-width: 768px) 100vw, 800px"
            quality={85}
            priority
          />
          <figcaption className="mt-2 text-sm text-zinc-600">
            992 GT3
          </figcaption>
        </figure>
      </section>
    </div>
  );
};

export default AboutPage;
