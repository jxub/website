---
title: "Messaging Queues Overview"
date: 2017-07-02T13:12:07+02:00
draft: true
tags: ["messaging systems", "software architecture"]
---
I wrote piece this while researching how does Kafka work, as we are using it at [Datamaran](https://www.datamaran.com/) for our messaging system. Hope you'll find this long slog a productive and enjoyable read ;)

Messaging queues allow applications to communicate y sending and reading messages between them. Every messaging queue implements an asynchronous protocol, that is a system that does not require for the message to be responded to immediately (think of, HTTP for example). This way, the producers and consumers of the messages are decoupled or separated from each other, reducing the complexity of the system and improving its scalability, as consumers and producers can be added or removed independently of each other, depending on the current requirements. They can even be developed in different languages or by different teams, as they share a common interface. To sum up, a messaging queue or system is a good way to achieve software and people scalability.

There are many messaging queues, each one with its set of tradeoffs and with its appropriate use-case. RabbitMQ, Apache Kafka, Redis and Amazon SQS are among the main ones. On a lower level, there are also some libraries for implementing messaging systems, where the case of ZeroMQ springs to mind. But here let’s explore the main types of messaging queues.

## RabbitMQ

RabbitMQ is, in essence, a message broker, it accepts and forwards messages asynchronously. It’s written in Erlang and works on the Erlang VM, and it has been used in production for almost ten years. This messaging system accepts multiple messaging protocols, such as AMQP (most widely used), STOMP, MQTT and others. Moreover, it provides support for message queuing, delivery acknowledgement, flexible routing to queues and multiple exchange types.

The RabbitMQ messaging model is composed of:

+   publishers: produce messages and send them
+   exchanges: route messages to the appropriate queue (optional)
+   queues: large message buffer that stores messages in memory, not in disk, and it can support multiple producers and customers
+   consumers: receive or read messages, they don’t have to be in the in the same server as the publishers
+   messages: they are sent through the queue, and their delivery to the consumers can be acknowledged optionally to avoid message loss at the cost of a performance penalty
+   binding: relationship of message-passing between a specific queue and an exchange that routes the messages to this queue.

The queue content persistence in RabbitMQ is both temporary and optional, as the storage is in memory for faster reads and writes. We can try to avoid data loss in case of messaging server failure by marking the queues and messages as durable. This way, we can save most of the messages to disk. In case we needed stronger consistency guarantees, we can use publisher confirms to ensure no message is lost.
On the other hand and as we said before, the delivery acknowledgements are used where needed to avoid data loss in case of consumer failure.

RabbitMQ supports a wide range of messaging patterns:

+   work queues: avoid doing a resource intensive task synchronously, pushing it instead to a queue to be distributed among multiple workers, called “the competing consumers pattern”
+   Pub/Sub or publish/subscribe: send a message to be delivered to many consumers, where an exchange can route the messages to some customers or all of them (“the fanout pattern”), used for log aggregation, activity traffic, etc.
+   RPC or Remote Procedure Call: executing a process on a different server and wait for the result. It’s blocking, and can add unnecessary complexity if misused. Here, the RPC request is made over a queue and an anonymous callback queue is created for each request or client. Then the publisher waits for the response of the client from the callback queue.


## Kafka

Kafka is a pub/sub messaging system better thought of as a distributed commit log. It works on the JVM, and it can be used as a centralized messaging bus between the producers and the customers, improving the scalability of the system. It is also highly available and fault-tolerant, as the information in it is replicated automatically.

The architecture of Kafka is composed of:

+   topics: categories where streams of records are stored
+   producers: write data to a specific topic to a single leader (see below), which allows for load balancing of the writes
+   brokers: each Kafka instance node in a distributed Kafka cluster
+   partitions: each topic is divided in a range of partitions, and partitions can be placed on different machines to allow for reads of a same topic in parallel
+   consumers: read from any single partition, and multiple consumers can be parallelized by reading from different partitions in a given topic (consumer groups)
+   messages: are indexed and stored together on a partition with a specific offset which is its identifier in an immutable sequence, so each message can be identified uniquely by its topic, partition and the offset in a given partition
+   leader: each partition can be a leader for a given topic, where all reads and writes are made, and the leader updates the other replica partitions with the new data; in case of leader failure one of the replicas takes over as the new leader

We should note here that consistency and availability (see CAP theorem) are valid only when producing to one partition and consuming from another one. This guarantees that:

+   messages to a topic partition will be appended to the partition log in order that they are sent
+   a single consumer will see the messages in the order that they are appended to the log
+   a replica is “in sync” if it has acknowledged all the messages from the leader
+   a message is “committed” when all in sync replicas have it appended to the log
+   any committed message won’t be lost as long as there is one replica in sync available

In a Kafka cluster we can also have different consistency guarantees. A producer can:

+   Wait for all in sync replicas for acknowledgement
+   Wait for the leader to acknowledge the message
+   Don’t wait for acknowledgement

A Kafka consumer, on the other hand, can:

+   receive each message at least once
+   receive each message at most once
+   receive each message exactly once

Each one with it’s set of strengths and drawbacks.


## Redis

Redis is an in-memory key-value store, which instead of storing the values as simple strings recognizes many concrete data types, with a set of features each one to manipulate the data in an atomic manner, ideal in concurrent or distributed systems. Redis can be used as a cache, database or message broker. Here, we will focus on the third use-case, as an alternative to RabbitMQ or Kafka.

As a message broker, Redis is simple to configure, lightweight, safe for concurrency, and with support for easy persistence to disk. Redis with its Pub/Sub implements a “listener” model where each subscriber receives each message, but only when it’s connected, failing to do so otherwise. A number of other more sophisticated messaging patterns can be built on the top of the basic Redis FIFO (First In, First Out) queue with relative ease, for example by generating an unique ID and timestamp for each message in the publishers and looking for messages with a certain timestamp in the consumers.
