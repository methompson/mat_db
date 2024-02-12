# Mat's Database
## A basic and naive database to learn about databases

I've been fascinated with how databases work for a long time and I decided to spend a little development time to explore getting one to work.

This database is a simple "document" based NoSQL database. It has similar operations as DynamoDB. The application has next to no optimizations as it stands and it's written in a relatively slow language simply to help with typing.

There's a series of functions, but no remote APIs or libraries (that's a completely different thing to consider) and currently, everything is in-memory. I.e. there is no persistence once the application is finished running.

There are several things that will be developed over time:

- Persistence
- Remote APIs
- Optimizations to speed up random access