package oasis;

import atlantafx.base.theme.NordDark;
import javafx.application.Application;
import javafx.application.Preloader;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.geometry.Rectangle2D;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.control.ProgressBar;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.StackPane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Rectangle;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;
import javafx.stage.Screen;
import javafx.stage.Stage;
import javafx.stage.StageStyle;

public class SplashScreen extends Preloader {
    private Stage splashStage;
    private ProgressBar progressBar;
    private Label progressText;
    private static final String APP_NAME = "OASIS";
    private static final String VERSION = "0.0.1";
    
    // Adjust these values to change the padding of title and version text
    private static final int TITLE_PADDING_LEFT = 20;
    private static final int TITLE_PADDING_TOP = 20;
    private static final int VERSION_PADDING_RIGHT = 20;
    private static final int VERSION_PADDING_TOP = 40;

    @Override
    public void start(Stage stage) throws Exception {
        splashStage = stage;
        splashStage.initStyle(StageStyle.TRANSPARENT);
        
        // Set the icon
        try {
            Image icon = new Image(getClass().getResourceAsStream("/exoplanet64.png"));
            splashStage.getIcons().add(icon);
        } catch (Exception e) {
            System.err.println("Failed to load application icon: " + e.getMessage());
        }
        
        // Load the splash image
        Image splashImage = new Image(getClass().getResourceAsStream("/splash.png"));
        ImageView imageView = new ImageView(splashImage);
        
        // Create a clip for rounded corners
        Rectangle clip = new Rectangle(
            splashImage.getWidth(), splashImage.getHeight()
        );
        clip.setArcWidth(35);
        clip.setArcHeight(35);
        imageView.setClip(clip);
        
        // Apply AtlantaFX theme
        Application.setUserAgentStylesheet(new NordDark().getUserAgentStylesheet());

        // Create ProgressBar
        progressBar = new ProgressBar();
        progressBar.setPrefWidth(splashImage.getWidth() - 40);
        progressBar.setPrefHeight(20);
        progressBar.getStyleClass().add("accent");

        // Create progress text
        progressText = new Label("Loading: 0%");
        progressText.setTextFill(Color.WHITE);

        // Create title label
        Label titleLabel = new Label(APP_NAME);
        titleLabel.setFont(Font.font("System", FontWeight.BOLD, 64));
        titleLabel.setTextFill(Color.WHITE);

        // Create version label
        Label versionLabel = new Label("Version: " + VERSION);
        versionLabel.setTextFill(Color.WHITE);

        // Create root StackPane
        StackPane root = new StackPane();
        root.getChildren().addAll(imageView, progressBar, progressText, titleLabel, versionLabel);

        // Position the progress bar and text
        StackPane.setAlignment(progressBar, Pos.CENTER);
        progressBar.setTranslateY(splashImage.getHeight() / 2 - 60);

        StackPane.setAlignment(progressText, Pos.CENTER);
        progressText.setTranslateY(progressBar.getTranslateY() - 25);

        // Position title and version labels
        StackPane.setAlignment(titleLabel, Pos.TOP_LEFT);
        StackPane.setMargin(titleLabel, new Insets(TITLE_PADDING_TOP, 0, 0, TITLE_PADDING_LEFT));

        StackPane.setAlignment(versionLabel, Pos.TOP_RIGHT);
        StackPane.setMargin(versionLabel, new Insets(VERSION_PADDING_TOP, VERSION_PADDING_RIGHT, 0, 0));

        // Apply the clip to the root StackPane
        Rectangle rootClip = new Rectangle(
            splashImage.getWidth(), splashImage.getHeight()
        );
        rootClip.setArcWidth(35);
        rootClip.setArcHeight(35);
        root.setClip(rootClip);

        Scene scene = new Scene(root);
        scene.setFill(null);
        
        splashStage.setScene(scene);
        
        // Center the splash screen on the primary screen
        Rectangle2D screenBounds = Screen.getPrimary().getVisualBounds();
        splashStage.setX((screenBounds.getWidth() - splashImage.getWidth()) / 2);
        splashStage.setY((screenBounds.getHeight() - splashImage.getHeight()) / 2);
        
        splashStage.show();
    }

    @Override
    public void handleApplicationNotification(PreloaderNotification info) {
        if (info instanceof ProgressNotification progressNotification) {
            double progress = progressNotification.getProgress();
            progressBar.setProgress(progress);
            progressText.setText(String.format("Loading: %.0f%%", progress * 100));
        }
    }

    @Override
    public void handleStateChangeNotification(StateChangeNotification info) {
        if (info.getType() == StateChangeNotification.Type.BEFORE_START) {
            splashStage.hide();
        }
    }
}