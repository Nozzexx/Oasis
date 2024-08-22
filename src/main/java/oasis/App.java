package oasis;

import atlantafx.base.theme.NordDark;
import javafx.application.Application;
import javafx.application.Preloader;
import javafx.geometry.Rectangle2D;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.image.Image;
import javafx.scene.layout.StackPane;
import javafx.stage.Screen;
import javafx.stage.Stage;

public class App extends Application {

    private static final int DEFAULT_WIDTH = 1600;
    private static final int DEFAULT_HEIGHT = 900;
    private static final String APP_NAME = "OASIS";
    private static final String VERSION = "0.1.1a";

    @Override
    public void init() throws Exception {
        // Simulate some loading time
        for (int i = 0; i < 10; i++) {
            double progress = (i + 1) / 10.0;
            notifyPreloader(new Preloader.ProgressNotification(progress));
            Thread.sleep(1000); // TODO: REMOVE | Simulate loading time for now.
        }
    }

    @Override
    public void start(Stage primaryStage) {
        Button btn = new Button("View Exoplanet");
        StackPane root = new StackPane();
        root.getChildren().add(btn);

        Scene scene = new Scene(root, DEFAULT_WIDTH, DEFAULT_HEIGHT);
        
        // Apply AtlantaFX theme
        Application.setUserAgentStylesheet(new NordDark().getUserAgentStylesheet());

        // Set the icon
        try {
            Image icon = new Image(getClass().getResourceAsStream("/exoplanet64.png"));
            primaryStage.getIcons().add(icon);
        } catch (Exception e) {
            System.err.println("Failed to load application icon: " + e.getMessage());
        }

        // Set window properties
        primaryStage.setTitle(APP_NAME + " | Version: " + VERSION);
        primaryStage.setMinWidth(DEFAULT_WIDTH);
        primaryStage.setMinHeight(DEFAULT_HEIGHT);
        primaryStage.setScene(scene);

        // Center the window on the primary screen
        Rectangle2D screenBounds = Screen.getPrimary().getVisualBounds();
        primaryStage.setX((screenBounds.getWidth() - DEFAULT_WIDTH) / 2);
        primaryStage.setY((screenBounds.getHeight() - DEFAULT_HEIGHT) / 2);

        primaryStage.show();
    }

    public static void main(String[] args) {
        System.setProperty("javafx.preloader", SplashScreen.class.getCanonicalName());
        launch(args);
    }
}