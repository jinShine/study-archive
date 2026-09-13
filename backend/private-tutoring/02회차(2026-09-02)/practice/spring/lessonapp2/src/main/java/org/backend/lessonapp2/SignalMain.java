package org.backend.lessonapp2;

import sun.misc.Signal;

public class SignalMain {
	public static void main(String[] args) throws InterruptedException {
		Signal.handle(new Signal("INT"), sig -> {
			System.out.println("SIGINT received!");
			// System.exit(0);
		});
		while (true) {
			Thread.sleep(1000);
			System.out.println("RUNNING...");
		}
	}
}
